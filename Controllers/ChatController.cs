using Microsoft.AspNetCore.Mvc;
using AIChatApplication.Services;
using Microsoft.AspNetCore.Authorization;

namespace AIChatApplication.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "ActiveAccount")]
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
        var result = await _chatApiService.GetExplanationAsync(request.Code, cancellationToken);
        return StatusCode(result.StatusCode, result);
    }
}

public record CodeRequest(string Code);
