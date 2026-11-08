namespace AIChatApplication.Responses;

/// <summary>Describes the current account session without exposing credentials.</summary>
public sealed record AccountSessionResponse(
    bool IsAuthenticated,
    Guid? UserId,
    string? Email,
    string? AccountStatus,
    IReadOnlyList<string> Roles,
    string AntiforgeryToken);

/// <summary>Describes the result of an account operation.</summary>
public sealed record AccountMessageResponse(string Message);

/// <summary>Describes the current account-access status.</summary>
public sealed record AccountStatusResponse(string AccountStatus);
