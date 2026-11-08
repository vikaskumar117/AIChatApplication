using System.ComponentModel.DataAnnotations;

namespace AIChatApplication.Requests;

/// <summary>Credentials used to sign in to an existing account.</summary>
public sealed record LoginRequest
{
    [Required, EmailAddress, MaxLength(254)]
    public required string Email { get; init; }

    [Required, MaxLength(128)]
    public required string Password { get; init; }
}
