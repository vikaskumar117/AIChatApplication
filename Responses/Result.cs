namespace AIChatApplication.Responses;

/// <summary>Provides a consistent response envelope for API results and errors.</summary>
public sealed record Result(
    int StatusCode,
    string? ErrorMessage,
    [property: System.Text.Json.Serialization.JsonPropertyName("result")] string? Data,
    string? DetailErrorMessage = null);
