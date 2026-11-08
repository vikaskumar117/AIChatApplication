namespace AIChatApplication.Options;

public sealed class OllamaOptions
{
    public string Endpoint { get; set; } = "http://localhost:11434/v1/chat/completions";

    public string Model { get; set; } = "llama3.2";

    public int TimeoutSeconds { get; set; } = 120;
}
