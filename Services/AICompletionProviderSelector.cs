using AIChatApplication.Options;
using Microsoft.Extensions.Options;

namespace AIChatApplication.Services;

/// <summary>
/// Resolves the server-configured provider once per request; clients cannot choose providers.
/// </summary>
public sealed class AICompletionProviderSelector : IAICompletionProviderSelector
{
    private readonly IAICompletionProvider _provider;

    public AICompletionProviderSelector(
        IOptions<AIProviderOptions> options,
        IEnumerable<IAICompletionProvider> providers)
    {
        var providerName = options.Value.Name;
        _provider = providers.FirstOrDefault(provider =>
            string.Equals(provider.Name, providerName, StringComparison.OrdinalIgnoreCase))
            ?? throw new InvalidOperationException(
                $"AI provider '{providerName}' is not registered.");
    }

    public IAICompletionProvider GetProvider() => _provider;
}
