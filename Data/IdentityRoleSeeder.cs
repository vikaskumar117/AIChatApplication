using Microsoft.AspNetCore.Identity;

namespace AIChatApplication.Data;

public static class IdentityRoleSeeder
{
    private static readonly string[] Roles = ["Admin", "GeneralUser"];

    public static async Task SeedAsync(
        RoleManager<IdentityRole<Guid>> roleManager,
        CancellationToken cancellationToken = default)
    {
        foreach (var roleName in Roles)
        {
            cancellationToken.ThrowIfCancellationRequested();

            if (await roleManager.RoleExistsAsync(roleName))
            {
                continue;
            }

            var result = await roleManager.CreateAsync(new IdentityRole<Guid>(roleName));
            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(error => error.Description));
                throw new InvalidOperationException(
                    $"Could not seed the '{roleName}' role: {errors}");
            }
        }
    }
}
