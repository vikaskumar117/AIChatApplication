namespace AIChatApplication.Services;

public interface IAICompletionProviderSelector
{
    IAICompletionProvider GetProvider();
}
