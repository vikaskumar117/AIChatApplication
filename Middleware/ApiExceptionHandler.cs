using AIChatApplication.Responses;
using Microsoft.AspNetCore.Diagnostics;

namespace AIChatApplication.Middleware;

public sealed class ApiExceptionHandler(
    ILogger<ApiExceptionHandler> logger,
    IWebHostEnvironment environment) : IExceptionHandler
{
    private const string ErrorMessage =
        "Application is experienceing a problem, please contact site administractor.";

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        logger.LogError(exception, "An unhandled exception occurred while processing the request.");

        var statusCode = StatusCodes.Status500InternalServerError;
        var response = new Result(
            statusCode,
            ErrorMessage,
            null,
            environment.IsDevelopment() ? exception.ToString() : null);

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);

        return true;
    }
}
