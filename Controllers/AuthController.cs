using System.Security.Claims;
using AIChatApplication.Data;
using AIChatApplication.Requests;
using AIChatApplication.Responses;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AIChatApplication.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    AppDbContext dbContext,
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IAntiforgery antiforgery) : ControllerBase
{
    [HttpGet("session")]
    [AllowAnonymous]
    [ProducesResponseType<AccountSessionResponse>(StatusCodes.Status200OK)]
    public async Task<ActionResult<AccountSessionResponse>> GetSession(
        CancellationToken cancellationToken)
    {
        Response.Headers.CacheControl = "no-store";
        var tokens = antiforgery.GetAndStoreTokens(HttpContext);
        var user = await userManager.GetUserAsync(User);
        if (user is null)
        {
            return Ok(new AccountSessionResponse(
                false,
                null,
                null,
                null,
                [],
                tokens.RequestToken ?? string.Empty));
        }

        var roles = await userManager.GetRolesAsync(user);
        cancellationToken.ThrowIfCancellationRequested();

        return Ok(new AccountSessionResponse(
            true,
            user.Id,
            user.Email,
            user.AccountStatus.ToString(),
            roles.ToArray(),
            tokens.RequestToken ?? string.Empty));
    }

    [HttpPost("register")]
    [AllowAnonymous]
    [ValidateAntiForgeryToken]
    [ProducesResponseType<AccountSessionResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<AccountMessageResponse>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AccountSessionResponse>> Register(
        RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim();
        var user = new ApplicationUser
        {
            UserName = normalizedEmail,
            Email = normalizedEmail,
            AccountStatus = AccountStatus.PendingApproval
        };

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        var createResult = await userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            await transaction.RollbackAsync(cancellationToken);
            if (createResult.Errors.Any(error => error.Code == "DuplicateUserName" ||
                                                 error.Code == "DuplicateEmail"))
            {
                return Conflict(new AccountMessageResponse(
                    "An account with this email already exists."));
            }

            foreach (var error in createResult.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }

            return ValidationProblem(ModelState);
        }

        var roleResult = await userManager.AddToRoleAsync(user, "GeneralUser");
        if (!roleResult.Succeeded)
        {
            await transaction.RollbackAsync(cancellationToken);
            var errors = string.Join("; ", roleResult.Errors.Select(error => error.Description));
            throw new InvalidOperationException($"Could not assign the default account role: {errors}");
        }

        await transaction.CommitAsync(cancellationToken);
        await signInManager.SignInAsync(user, isPersistent: false);

        var tokens = antiforgery.GetAndStoreTokens(HttpContext);
        var roles = await userManager.GetRolesAsync(user);
        return CreatedAtAction(
            nameof(GetSession),
            value: new AccountSessionResponse(
                true,
                user.Id,
                user.Email,
                user.AccountStatus.ToString(),
                roles.ToArray(),
                tokens.RequestToken ?? string.Empty));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [ValidateAntiForgeryToken]
    [ProducesResponseType<AccountSessionResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<AccountMessageResponse>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<AccountMessageResponse>(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<AccountSessionResponse>> Login(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var email = request.Email.Trim();
        var user = await userManager.FindByEmailAsync(email);
        if (user is null || user.AccountStatus is AccountStatus.Blocked or AccountStatus.Rejected)
        {
            return Unauthorized(new AccountMessageResponse("Invalid email or password."));
        }

        var result = await signInManager.PasswordSignInAsync(
            user,
            request.Password,
            isPersistent: false,
            lockoutOnFailure: true);
        if (!result.Succeeded)
        {
            return Unauthorized(new AccountMessageResponse("Invalid email or password."));
        }

        cancellationToken.ThrowIfCancellationRequested();
        var tokens = antiforgery.GetAndStoreTokens(HttpContext);
        var roles = await userManager.GetRolesAsync(user);
        return Ok(new AccountSessionResponse(
            true,
            user.Id,
            user.Email,
            user.AccountStatus.ToString(),
            roles.ToArray(),
            tokens.RequestToken ?? string.Empty));
    }

    [HttpPost("logout")]
    [Authorize]
    [ValidateAntiForgeryToken]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout()
    {
        await signInManager.SignOutAsync();
        return NoContent();
    }

    [HttpPut("users/{userId:guid}/status")]
    [Authorize(Roles = "Admin", Policy = "ActiveAccount")]
    [ValidateAntiForgeryToken]
    [ProducesResponseType<AccountStatusResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<AccountMessageResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AccountStatusResponse>> UpdateAccountStatus(
        Guid userId,
        UpdateAccountStatusRequest request,
        CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<AccountStatus>(request.AccountStatus, ignoreCase: true, out var status) ||
            status == AccountStatus.PendingApproval)
        {
            return BadRequest(new AccountMessageResponse(
                "Status must be Active, Blocked, or Rejected."));
        }

        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null)
        {
            return NotFound();
        }

        user.AccountStatus = status;
        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(error => error.Description));
            throw new InvalidOperationException($"Could not update account status: {errors}");
        }

        cancellationToken.ThrowIfCancellationRequested();
        return Ok(new AccountStatusResponse(user.AccountStatus.ToString()));
    }
}
