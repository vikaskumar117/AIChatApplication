using System.ComponentModel.DataAnnotations;

namespace AIChatApplication.Requests;

/// <summary>Credentials used to register a new account.</summary>
public sealed record RegisterRequest
{
    [Required, EmailAddress, MaxLength(254)]
    public required string Email { get; init; }

    [Required, MinLength(12), MaxLength(128)]
    public required string Password { get; init; }
}
