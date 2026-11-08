using AIChatApplication.Responses;

namespace AIChatApplication.Services;

public interface IChatApiService
{
    Task<Result> GetExplanationAsync(string code, CancellationToken cancellationToken = default);
}
