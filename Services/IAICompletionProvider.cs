namespace AIChatApplication.Services;

/// <summary>Adapts the shared completion contract to one configured AI provider.</summary>
public interface IAICompletionProvider
{
    string Name { get; }

    Task<AICompletion> CompleteAsync(
        AICompletionRequest request,
        CancellationToken cancellationToken = default);
}
