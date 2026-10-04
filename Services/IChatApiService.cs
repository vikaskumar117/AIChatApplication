namespace AIChatApplication.Services;

public interface IChatApiService
{
    Task<string> GetExplanationAsync(string code, CancellationToken cancellationToken = default);
}
