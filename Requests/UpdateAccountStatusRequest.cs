using System.ComponentModel.DataAnnotations;

namespace AIChatApplication.Requests;

/// <summary>Sets an account's administrative access status.</summary>
public sealed record UpdateAccountStatusRequest
{
    [Required, MaxLength(32)]
    public required string AccountStatus { get; init; }
}
