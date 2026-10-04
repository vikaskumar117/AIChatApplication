using Microsoft.AspNetCore.Mvc;
using AIChatApplication.Services;

namespace AIChatApplication.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IChatApiService _chatApiService;

    public ChatController(IChatApiService chatApiService)
    {
        _chatApiService = chatApiService;
    }

    [HttpPost("explain")]
    public async Task<IActionResult> Explain([FromBody] CodeRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
        {
            return BadRequest(new { error = "Code is required." });
        }

        var result = await _chatApiService.GetExplanationAsync(request.Code, cancellationToken);
        return Ok(new CodeExplanationResponse(result));
    }
}

// Request and Response DTOs
public record CodeRequest(string Code);
public record CodeExplanationResponse(string Explanation);
