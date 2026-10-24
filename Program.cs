using AIChatApplication.Services;
using AIChatApplication.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
builder.Services.AddProblemDetails();

// Configure Swagger (Swashbuckle)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register HttpClient for Ollama use
builder.Services.AddHttpClient();

// Register Chat Application Service
builder.Services.AddScoped<IChatApiService, OllamaChatApiService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
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
