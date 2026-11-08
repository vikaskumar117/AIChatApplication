namespace AIChatApplication.Services;

/// <summary>
/// Immutable message data shared by the application and its provider adapters.
/// A record provides value equality; sealing prevents provider-specific subclasses.
/// </summary>
public sealed record AIMessage(string Role, string Content);
