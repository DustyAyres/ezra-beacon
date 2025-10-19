using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web.Resource;
using EzraBeacon.Core;
using EzraBeacon.Core.Entities;
using EzraBeacon.Infrastructure.Data;
using EzraBeacon.Api.DTOs;
using System.Security.Claims;

namespace EzraBeacon.Api.Controllers;

/// <summary>
/// API controller for managing tasks
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class TasksController : ControllerBase
{
    private readonly EzraBeaconContext _context;
    private readonly ILogger<TasksController> _logger;

    public TasksController(EzraBeaconContext context, ILogger<TasksController> logger)
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

    /// <summary>
    /// Get task counts for different views
    /// </summary>
    /// <returns>Task counts for My Day, Important, Planned, and All tasks</returns>
    /// <response code="200">Returns the task counts</response>
    [HttpGet("counts")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<TaskCountsDto>> GetTaskCounts()
    {
        var userId = GetUserId();
        var today = DateTime.UtcNow.Date;

        var tasks = await _context.TaskItems
            .Where(t => t.UserId == userId && !t.IsCompleted)
            .ToListAsync();

        var counts = new TaskCountsDto
        {
            MyDay = tasks.Count(t => t.DueDate?.Date == today),
            Important = tasks.Count(t => t.IsImportant),
            Planned = tasks.Count(t => t.DueDate != null),
            All = tasks.Count
        };

        return counts;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks(
        [FromQuery] string? view = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] Guid? categoryId = null)
    {
        var userId = GetUserId();
        var query = _context.TaskItems
            .Include(t => t.Category)
            .Include(t => t.Steps)
            .Where(t => t.UserId == userId);

        // Apply view filters
        switch (view?.ToLower())
        {
            case "myday":
                var today = DateTime.UtcNow.Date;
                query = query.Where(t => t.DueDate.HasValue && t.DueDate.Value.Date == today);
                break;
            case "important":
                query = query.Where(t => t.IsImportant);
                break;
            case "planned":
                query = query.Where(t => t.DueDate.HasValue);
                break;
        }

        // Apply category filter
        if (categoryId.HasValue)
        {
            query = query.Where(t => t.CategoryId == categoryId);
        }

        // Apply sorting
        query = sortBy?.ToLower() switch
        {
            "importance" => query.OrderByDescending(t => t.IsImportant).ThenBy(t => t.CreatedAt),
            "duedate" => query.OrderBy(t => t.DueDate ?? DateTime.MaxValue).ThenBy(t => t.CreatedAt),
            "alphabetically" => query.OrderBy(t => t.Title),
            "creationdate" => query.OrderBy(t => t.CreatedAt),
            _ => query.OrderBy(t => t.CreatedAt)
        };

        return await query.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItem>> GetTask(Guid id)
    {
        var userId = GetUserId();
        var task = await _context.TaskItems
            .Include(t => t.Category)
            .Include(t => t.Steps.OrderBy(s => s.Order))
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (task == null)
        {
            return NotFound();
        }

        return task;
    }

    [HttpPost]
    public async Task<ActionResult<TaskItem>> CreateTask([FromBody] CreateTaskDto dto)
    {
        var userId = GetUserId();

        // Validate category exists and belongs to user
        if (dto.CategoryId.HasValue)
        {
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == dto.CategoryId && c.UserId == userId);

            if (!categoryExists)
            {
                return BadRequest("Invalid category");
            }
        }

        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            DueDate = dto.DueDate,
            IsImportant = dto.IsImportant,
            RecurrenceType = dto.RecurrenceType,
            CustomRecurrencePattern = dto.CustomRecurrencePattern,
            CategoryId = dto.CategoryId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.TaskItems.Add(task);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(Guid id, [FromBody] UpdateTaskDto dto)
    {
        var userId = GetUserId();
        var task = await _context.TaskItems
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (task == null)
        {
            return NotFound();
        }

        // Validate category if changing
        if (dto.CategoryId.HasValue && dto.CategoryId != task.CategoryId)
        {
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == dto.CategoryId && c.UserId == userId);

            if (!categoryExists)
            {
                return BadRequest("Invalid category");
            }
        }

        task.Title = dto.Title ?? task.Title;
        task.DueDate = dto.DueDate;
        task.IsImportant = dto.IsImportant ?? task.IsImportant;
        task.IsCompleted = dto.IsCompleted ?? task.IsCompleted;
        task.RecurrenceType = dto.RecurrenceType ?? task.RecurrenceType;
        task.CustomRecurrencePattern = dto.CustomRecurrencePattern ?? task.CustomRecurrencePattern;
        task.CategoryId = dto.CategoryId;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        var userId = GetUserId();
        var task = await _context.TaskItems
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (task == null)
        {
            return NotFound();
        }

        _context.TaskItems.Remove(task);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{taskId}/steps")]
    public async Task<ActionResult<TaskStep>> AddStep(Guid taskId, [FromBody] CreateStepDto dto)
    {
        var userId = GetUserId();
        var task = await _context.TaskItems
            .Include(t => t.Steps)
            .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);

        if (task == null)
        {
            return NotFound();
        }

        if (task.Steps.Count >= AppConstants.MaxStepsPerTask)
        {
            return BadRequest($"Task cannot have more than {AppConstants.MaxStepsPerTask} steps");
        }

        var step = new TaskStep
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            TaskItemId = taskId,
            Order = task.Steps.Count > 0 ? task.Steps.Max(s => s.Order) + 1 : 0
        };

        _context.TaskSteps.Add(step);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTask), new { id = taskId }, step);
    }

    [HttpPut("{taskId}/steps/{stepId}")]
    public async Task<IActionResult> UpdateStep(Guid taskId, Guid stepId, [FromBody] UpdateStepDto dto)
    {
        var userId = GetUserId();
        var task = await _context.TaskItems
            .Include(t => t.Steps)
            .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);

        if (task == null)
        {
            return NotFound();
        }

        var step = task.Steps.FirstOrDefault(s => s.Id == stepId);
        if (step == null)
        {
            return NotFound();
        }

        step.Title = dto.Title ?? step.Title;
        step.IsCompleted = dto.IsCompleted ?? step.IsCompleted;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{taskId}/steps/{stepId}")]
    public async Task<IActionResult> DeleteStep(Guid taskId, Guid stepId)
    {
        var userId = GetUserId();
        var task = await _context.TaskItems
            .Include(t => t.Steps)
            .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);

        if (task == null)
        {
            return NotFound();
        }

        var step = task.Steps.FirstOrDefault(s => s.Id == stepId);
        if (step == null)
        {
            return NotFound();
        }

        _context.TaskSteps.Remove(step);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
