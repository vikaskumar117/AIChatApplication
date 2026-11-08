using System.Net.Http.Headers;
using System.Net.Http.Json;
using AIChatApplication.Options;
using Microsoft.Extensions.Options;

namespace AIChatApplication.Services;

public sealed class OpenAIChatCompletionProvider : IAICompletionProvider
{
    public const string ProviderName = "OpenAI";
    public const string HttpClientName = "OpenAI";

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly OpenAIOptions _options;

    public OpenAIChatCompletionProvider(
        IHttpClientFactory httpClientFactory,
        IOptions<OpenAIOptions> options)
    {
        _httpClientFactory = httpClientFactory;
        _options = options.Value;
    }

    public string Name => ProviderName;

    public async Task<AICompletion> CompleteAsync(
        AICompletionRequest request,
        CancellationToken cancellationToken = default)
    {
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, _options.Endpoint)
        {
            Content = JsonContent.Create(
                OpenAICompatibleProtocol.CreateRequestBody(_options.Model, request))
        };
        httpRequest.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", _options.ApiKey);

        using var response = await _httpClientFactory
            .CreateClient(HttpClientName)
            .SendAsync(httpRequest, cancellationToken);
        response.EnsureSuccessStatusCode();

        var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
        return OpenAICompatibleProtocol.ParseCompletion(responseJson, _options.Model);
    }
}
