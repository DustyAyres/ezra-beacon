using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web.Resource;
using EzraBeacon.Core.Entities;
using EzraBeacon.Infrastructure.Data;
using System.Security.Claims;

namespace EzraBeacon.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly EzraBeaconContext _context;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(EzraBeaconContext context, ILogger<CategoriesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private string GetUserId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? 
               User.FindFirst("oid")?.Value ?? 
               throw new UnauthorizedAccessException("User ID not found");
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
    {
        var userId = GetUserId();
        return await _context.Categories
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Category>> GetCategory(Guid id)
    {
        var userId = GetUserId();
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (category == null)
        {
            return NotFound();
        }

        return category;
    }

    [HttpPost]
    public async Task<ActionResult<Category>> CreateCategory(CreateCategoryDto dto)
    {
        var userId = GetUserId();

        // Check if category with same name already exists for user
        var exists = await _context.Categories
            .AnyAsync(c => c.UserId == userId && c.Name == dto.Name);

        if (exists)
        {
            return BadRequest("Category with this name already exists");
        }

        // Validate hex color
        if (!IsValidHexColor(dto.ColorHex))
        {
            return BadRequest("Invalid color format. Please provide a valid hex color (e.g., #0078D4)");
        }

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            ColorHex = dto.ColorHex,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(Guid id, UpdateCategoryDto dto)
    {
        var userId = GetUserId();
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (category == null)
        {
            return NotFound();
        }

        // Check if new name already exists for another category
        if (!string.IsNullOrEmpty(dto.Name) && dto.Name != category.Name)
        {
            var exists = await _context.Categories
                .AnyAsync(c => c.UserId == userId && c.Name == dto.Name && c.Id != id);

            if (exists)
            {
                return BadRequest("Category with this name already exists");
            }
        }

        // Validate hex color if provided
        if (!string.IsNullOrEmpty(dto.ColorHex) && !IsValidHexColor(dto.ColorHex))
        {
            return BadRequest("Invalid color format. Please provide a valid hex color (e.g., #0078D4)");
        }

        category.Name = dto.Name ?? category.Name;
        category.ColorHex = dto.ColorHex ?? category.ColorHex;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        var userId = GetUserId();
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (category == null)
        {
            return NotFound();
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool IsValidHexColor(string hex)
    {
        if (string.IsNullOrEmpty(hex) || hex.Length != 7 || hex[0] != '#')
            return false;

        return hex.Substring(1).All(c => "0123456789ABCDEFabcdef".Contains(c));
    }
}

// DTOs
public class CreateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string ColorHex { get; set; } = "#0078D4";
}

public class UpdateCategoryDto
{
    public string? Name { get; set; }
    public string? ColorHex { get; set; }
}
