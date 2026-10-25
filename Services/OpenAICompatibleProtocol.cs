using System.Text.Json;

namespace AIChatApplication.Services;

internal static class OpenAICompatibleProtocol
{
    public static object CreateRequestBody(
        string model,
        AICompletionRequest request) =>
        new
        {
            model,
            messages = request.Messages,
            max_tokens = request.MaxOutputTokens
        };

    public static AICompletion ParseCompletion(string responseJson, string model)
    {
        using var document = JsonDocument.Parse(responseJson);
        var root = document.RootElement;

        if (root.TryGetProperty("choices", out var choices) &&
            choices.ValueKind == JsonValueKind.Array &&
            choices.GetArrayLength() > 0 &&
            choices[0].TryGetProperty("message", out var message) &&
            message.TryGetProperty("content", out var content) &&
            content.ValueKind == JsonValueKind.String &&
            !string.IsNullOrWhiteSpace(content.GetString()))
        {
            return new AICompletion(content.GetString()!, model);
        }

        throw new JsonException("The provider response did not contain a completion.");
    }
}
