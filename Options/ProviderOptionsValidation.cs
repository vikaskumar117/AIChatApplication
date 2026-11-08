namespace AIChatApplication.Options;

public static class ProviderOptionsValidation
{
    public static bool IsSupportedProvider(string? providerName) =>
        string.Equals(providerName, "Ollama", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(providerName, "OpenAI", StringComparison.OrdinalIgnoreCase);

    public static bool IsValidEndpoint(string? endpoint) =>
        Uri.TryCreate(endpoint, UriKind.Absolute, out var uri) &&
        (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps) &&
        string.IsNullOrEmpty(uri.UserInfo) &&
        string.IsNullOrEmpty(uri.Query) &&
        string.IsNullOrEmpty(uri.Fragment);

    public static bool IsValidTimeout(int timeoutSeconds) =>
        timeoutSeconds is > 0 and <= 600;
}
