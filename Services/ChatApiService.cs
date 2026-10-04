using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace AIChatApplication.Services;

public class ChatApiService : IChatApiService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public ChatApiService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    public async Task<string> GetExplanationAsync(string code, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(code))
            return "No code provided.";

        var apiKey = _configuration["OpenAI:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException("OpenAI API key is missing in configuration.");

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        // Build the prompt
        var prompt = $"""
            You are an senior .NET developer. Explain the following in simple words. Keep your explanation below 200 words.

            C# Code:
            {code}
            """;

        // OpenAI Chat Completions request body (compatible with OpenAI v1/chat/completions)
        var requestBody = new
        {
            model = _configuration["OpenAI:Model"] ?? "gpt-4o-mini",
            messages = new[]
            {
                new { role = "user", content = prompt }
            },
            max_tokens = 300
        };

        var json = JsonSerializer.Serialize(requestBody);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");

        using var response = await client.PostAsync("https://api.openai.com/v1/chat/completions", content, cancellationToken);
        response.EnsureSuccessStatusCode();

        var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);

        using var doc = JsonDocument.Parse(responseJson);
        // Navigate response to choices[0].message.content
        if (doc.RootElement.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
        {
            var first = choices[0];
            if (first.TryGetProperty("message", out var message) && message.TryGetProperty("content", out var contentElem))
            {
                return contentElem.GetString() ?? string.Empty;
            }
        }

        return string.Empty;
    }
}
