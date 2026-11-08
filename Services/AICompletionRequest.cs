namespace AIChatApplication.Services;

/// <summary>
/// Provider-neutral completion input; provider-specific HTTP fields are added by adapters.
/// </summary>
public sealed record AICompletionRequest(
    IReadOnlyList<AIMessage> Messages,
    int MaxOutputTokens);
