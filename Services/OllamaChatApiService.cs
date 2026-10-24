using System.Text;
using System.Text.Json;
using AIChatApplication.Responses;
using Microsoft.AspNetCore.Http;

namespace AIChatApplication.Services;

public class OllamaChatApiService : IChatApiService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<OllamaChatApiService> _logger;

    public OllamaChatApiService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<OllamaChatApiService> logger)
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
            var endpoint = _configuration["Ollama:Endpoint"]
                ?? "http://localhost:11434/v1/chat/completions";
            var model = _configuration["Ollama:Model"] ?? "llama3.2";
            var client = _httpClientFactory.CreateClient();

            var prompt = $"""
                You are a senior .NET developer. Explain the following in simple words. Keep your explanation below 200 words.

                C# Code:
                {code}
                """;

            var requestBody = new
            {
                model,
                messages = new[]
                {
                    new { role = "user", content = prompt }
                },
                max_tokens = 300
            };

            var json = JsonSerializer.Serialize(requestBody);
            using var content = new StringContent(json, Encoding.UTF8, "application/json");
            using var response = await client.PostAsync(endpoint, content, cancellationToken);
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

            throw new JsonException("Ollama response did not contain a chat completion.");
        }
        catch (HttpRequestException exception)
        {
            _logger.LogError(exception, "The request to Ollama failed.");
            return new Result(
                StatusCodes.Status500InternalServerError,
                "Unable to get an explanation from Ollama. Ensure Ollama is running and the configured model is available.",
                null);
        }
        catch (JsonException exception)
        {
            _logger.LogError(exception, "Ollama returned an invalid chat completion response.");
            return new Result(
                StatusCodes.Status502BadGateway,
                "Ollama returned an invalid response. Please try again.",
                null);
        }
        catch (Exception exception) when (exception is not OperationCanceledException || !cancellationToken.IsCancellationRequested)
        {
            _logger.LogError(exception, "An unexpected error occurred while requesting an explanation from Ollama.");
            return new Result(
                StatusCodes.Status500InternalServerError,
                "Unable to get an explanation from Ollama. Please try again later.",
                null);
        }
    }
}
