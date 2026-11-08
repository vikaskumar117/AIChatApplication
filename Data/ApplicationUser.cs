using Microsoft.AspNetCore.Identity;

namespace AIChatApplication.Data;

public enum AccountStatus
{
    PendingApproval,
    Active,
    Blocked,
    Rejected
}

public sealed class ApplicationUser : IdentityUser<Guid>
{
    public AccountStatus AccountStatus { get; set; } = AccountStatus.PendingApproval;
}
