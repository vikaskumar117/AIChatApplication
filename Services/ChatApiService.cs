using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using AIChatApplication.Responses;
using Microsoft.AspNetCore.Http;

namespace AIChatApplication.Services;

public class ChatApiService : IChatApiService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ChatApiService> _logger;

    public ChatApiService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<ChatApiService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<Result> GetExplanationAsync(string code, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            return new Result(StatusCodes.Status400BadRequest, "Code is required.", null);
        }

        try
        {
            var apiKey = _configuration["OpenAI:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey))
                throw new InvalidOperationException("OpenAI API key is missing in configuration.");

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var prompt = $"""
                You are an senior .NET developer. Explain the following in simple words. Keep your explanation below 200 words.

                C# Code:
                {code}
                """;

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
            if (doc.RootElement.TryGetProperty("choices", out var choices) &&
                choices.ValueKind == JsonValueKind.Array &&
                choices.GetArrayLength() > 0 &&
                choices[0].TryGetProperty("message", out var message) &&
                message.TryGetProperty("content", out var contentElement) &&
                contentElement.ValueKind == JsonValueKind.String)
            {
                return new Result(StatusCodes.Status200OK, null, contentElement.GetString());
            }

            throw new JsonException("OpenAI response did not contain a chat completion.");
        }
        catch (Exception exception) when (exception is not OperationCanceledException || !cancellationToken.IsCancellationRequested)
        {
            _logger.LogError(exception, "The request to OpenAI failed.");
            return new Result(
                StatusCodes.Status500InternalServerError,
                "Unable to get an explanation. Please try again later.",
                null);
        }
    }
}
