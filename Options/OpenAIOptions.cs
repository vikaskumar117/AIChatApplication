namespace AIChatApplication.Options;

public sealed class OpenAIOptions
{
    public string Endpoint { get; set; } = "https://api.openai.com/v1/chat/completions";

    public string Model { get; set; } = "gpt-4o-mini";

    public string ApiKey { get; set; } = string.Empty;

    public int TimeoutSeconds { get; set; } = 60;
}
