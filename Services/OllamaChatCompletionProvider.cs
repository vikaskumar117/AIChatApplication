using System.Net.Http.Json;
using System.Text.Json;
using AIChatApplication.Options;
using Microsoft.Extensions.Options;

namespace AIChatApplication.Services;

public sealed class OllamaChatCompletionProvider : IAICompletionProvider
{
    public const string ProviderName = "Ollama";
    public const string HttpClientName = "Ollama";

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly OllamaOptions _options;

    public OllamaChatCompletionProvider(
        IHttpClientFactory httpClientFactory,
        IOptions<OllamaOptions> options)
    {
        _httpClientFactory = httpClientFactory;
        _options = options.Value;
    }

    public string Name => ProviderName;

    public async Task<AICompletion> CompleteAsync(
        AICompletionRequest request,
        CancellationToken cancellationToken = default)
    {
        using var response = await _httpClientFactory
            .CreateClient(HttpClientName)
            .PostAsJsonAsync(
                _options.Endpoint,
                OpenAICompatibleProtocol.CreateRequestBody(_options.Model, request),
                cancellationToken);
        response.EnsureSuccessStatusCode();

        var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
        return OpenAICompatibleProtocol.ParseCompletion(responseJson, _options.Model);
    }
}
