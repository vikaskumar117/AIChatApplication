using AIChatApplication.Responses;
using Microsoft.AspNetCore.Http;

namespace AIChatApplication.Services;

public sealed class ChatApiService : IChatApiService
{
    private const int MaxOutputTokens = 300;

    private readonly IAICompletionProviderSelector _providerSelector;
    private readonly ILogger<ChatApiService> _logger;

    public ChatApiService(
        IAICompletionProviderSelector providerSelector,
        ILogger<ChatApiService> logger)
    {
        _providerSelector = providerSelector;
        _logger = logger;
    }

    public async Task<Result> GetExplanationAsync(
        string code,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            return new Result(StatusCodes.Status400BadRequest, "Code is required.", null);
        }

        var provider = _providerSelector.GetProvider();
        var prompt = $"""
            You are a senior .NET developer. Explain the following in simple words. Keep your explanation below 200 words.

            C# Code:
            {code}
            """;

        var request = new AICompletionRequest(
            [new AIMessage("user", prompt)],
            MaxOutputTokens);

        try
        {
            var completion = await provider.CompleteAsync(request, cancellationToken);
            return new Result(StatusCodes.Status200OK, null, completion.Text);
        }
        catch (HttpRequestException exception)
        {
            _logger.LogError(exception, "The request to AI provider {Provider} failed.", provider.Name);
            return ProviderFailure();
        }
        catch (System.Text.Json.JsonException exception)
        {
            _logger.LogError(exception, "AI provider {Provider} returned an invalid response.", provider.Name);
            return ProviderFailure();
        }
        catch (OperationCanceledException exception) when (!cancellationToken.IsCancellationRequested)
        {
            _logger.LogError(exception, "The request to AI provider {Provider} timed out.", provider.Name);
            return new Result(
                StatusCodes.Status504GatewayTimeout,
                "The configured AI provider did not respond in time. Please try again.",
                null);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "An unexpected error occurred while requesting a completion from {Provider}.", provider.Name);
            return ProviderFailure();
        }
    }

    private static Result ProviderFailure() =>
        new(
            StatusCodes.Status502BadGateway,
            "The configured AI provider could not complete the request. Check provider availability and configuration, then try again.",
            null);
}
