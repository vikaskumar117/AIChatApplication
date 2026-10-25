namespace AIChatApplication.Responses;

/// <summary>
/// API response envelope. A sealed record gives this data contract value equality
/// without allowing behavior-changing subclasses.
/// </summary>
public sealed record Result(
    int StatusCode,
    string? ErrorMessage,
    [property: System.Text.Json.Serialization.JsonPropertyName("result")] string? Data,
    string? DetailErrorMessage = null);
