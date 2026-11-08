namespace AIChatApplication.Services;

/// <summary>A provider-neutral completion result returned to application code.</summary>
public sealed record AICompletion(
    string Text,
    string Model);
