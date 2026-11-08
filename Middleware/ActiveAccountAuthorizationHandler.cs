using System.Security.Claims;
using AIChatApplication.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

namespace AIChatApplication.Middleware;

public sealed class ActiveAccountAuthorizationHandler(
    UserManager<ApplicationUser> userManager)
    : AuthorizationHandler<ActiveAccountRequirement>
{
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ActiveAccountRequirement requirement)
    {
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userId, out var parsedUserId))
        {
            return;
        }

        var user = await userManager.FindByIdAsync(parsedUserId.ToString());
        if (user?.AccountStatus == AccountStatus.Active)
        {
            context.Succeed(requirement);
        }
    }
}
