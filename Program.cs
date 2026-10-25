using AIChatApplication.Services;
using AIChatApplication.Middleware;
using AIChatApplication.Options;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);
var selectedProviderName = builder.Configuration["AIProvider:Name"] ?? "Ollama";

// Register MVC controller support and a consistent fallback for unhandled errors.
builder.Services.AddControllers();
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
builder.Services.AddProblemDetails();

// Swashbuckle generates the OpenAPI document; the UI is enabled below in Development.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Bind related settings from configuration and fail at startup instead of on the first chat request.
builder.Services.AddOptions<AIProviderOptions>()
    .BindConfiguration("AIProvider")
    .Validate(
        options => ProviderOptionsValidation.IsSupportedProvider(options.Name),
        "AIProvider:Name must be either 'Ollama' or 'OpenAI'.")
    .ValidateOnStart();

// Validate provider-specific settings only when that provider is selected.
builder.Services.AddOptions<OllamaOptions>()
    .BindConfiguration("Ollama")
    .Validate(
        options => !selectedProviderName.Equals(OllamaChatCompletionProvider.ProviderName, StringComparison.OrdinalIgnoreCase) ||
            (ProviderOptionsValidation.IsValidEndpoint(options.Endpoint) &&
             !string.IsNullOrWhiteSpace(options.Model) &&
             ProviderOptionsValidation.IsValidTimeout(options.TimeoutSeconds)),
        "Ollama endpoint, model, and timeout must be valid when Ollama is selected.")
    .ValidateOnStart();

builder.Services.AddOptions<OpenAIOptions>()
    .BindConfiguration("OpenAI")
    .Validate(
        options => !selectedProviderName.Equals(OpenAIChatCompletionProvider.ProviderName, StringComparison.OrdinalIgnoreCase) ||
            (ProviderOptionsValidation.IsValidEndpoint(options.Endpoint) &&
             !string.IsNullOrWhiteSpace(options.Model) &&
             !string.IsNullOrWhiteSpace(options.ApiKey) &&
             ProviderOptionsValidation.IsValidTimeout(options.TimeoutSeconds)),
        "OpenAI endpoint, model, API key, and timeout must be valid when OpenAI is selected.")
    .ValidateOnStart();

// Named clients keep independent timeouts and provider HTTP configuration.
builder.Services.AddHttpClient(
    OllamaChatCompletionProvider.HttpClientName,
    (serviceProvider, client) =>
    {
        var options = serviceProvider.GetRequiredService<IOptions<OllamaOptions>>().Value;
        client.Timeout = TimeSpan.FromSeconds(options.TimeoutSeconds);
    });

builder.Services.AddHttpClient(
    OpenAIChatCompletionProvider.HttpClientName,
    (serviceProvider, client) =>
    {
        var options = serviceProvider.GetRequiredService<IOptions<OpenAIOptions>>().Value;
        client.Timeout = TimeSpan.FromSeconds(options.TimeoutSeconds);
    });

// The selector supplies the configured adapter; application/controller code stays provider-neutral.
builder.Services.AddScoped<IAICompletionProvider, OllamaChatCompletionProvider>();
builder.Services.AddScoped<IAICompletionProvider, OpenAIChatCompletionProvider>();
builder.Services.AddScoped<IAICompletionProviderSelector, AICompletionProviderSelector>();
builder.Services.AddScoped<IChatApiService, ChatApiService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    // Swagger JSON describes the API; Swagger UI is served at the app root for local exploration.
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.RoutePrefix = string.Empty; // serve Swagger UI at app root
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "AIChatApplication v1");
        options.DocumentTitle = "AIChatApplication API";
    });
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
