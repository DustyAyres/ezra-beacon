using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EzraBeacon.Api.Controllers;
using EzraBeacon.Core.Entities;
using EzraBeacon.Infrastructure.Data;

namespace EzraBeacon.Tests.Controllers;

public class TasksControllerTests : IDisposable
{
    private readonly EzraBeaconContext _context;
    private readonly TasksController _controller;
    private readonly string _testUserId = "test-user-123";

    public TasksControllerTests()
    {
        var options = new DbContextOptionsBuilder<EzraBeaconContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new EzraBeaconContext(options);
        var logger = new Mock<ILogger<TasksController>>();
        _controller = new TasksController(_context, logger.Object);

        // Setup user context
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim("oid", _testUserId),
        }, "mock"));

        _controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    [Fact]
    public async Task GetTasks_ReturnsOnlyUserTasks()
    {
        // Arrange
        var userTask = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = "User Task",
            UserId = _testUserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var otherUserTask = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = "Other User Task",
            UserId = "other-user",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.TaskItems.AddRange(userTask, otherUserTask);
        await _context.SaveChangesAsync();

        // Act
        var result = await _controller.GetTasks();

        // Assert
        var actionResult = Assert.IsType<ActionResult<IEnumerable<TaskItem>>>(result);
        var tasks = Assert.IsAssignableFrom<IEnumerable<TaskItem>>(actionResult.Value);
        Assert.Single(tasks);
        Assert.Equal(userTask.Id, tasks.First().Id);
    }

    [Fact]
    public async Task GetTasks_WithMyDayView_ReturnsOnlyTodayTasks()
    {
        // Arrange
        var todayTask = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = "Today Task",
            UserId = _testUserId,
            DueDate = DateTime.UtcNow.Date,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var tomorrowTask = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = "Tomorrow Task",
            UserId = _testUserId,
            DueDate = DateTime.UtcNow.Date.AddDays(1),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.TaskItems.AddRange(todayTask, tomorrowTask);
        await _context.SaveChangesAsync();

        // Act
        var result = await _controller.GetTasks(view: "myday");

        // Assert
        var actionResult = Assert.IsType<ActionResult<IEnumerable<TaskItem>>>(result);
        var tasks = Assert.IsAssignableFrom<IEnumerable<TaskItem>>(actionResult.Value);
        Assert.Single(tasks);
        Assert.Equal(todayTask.Id, tasks.First().Id);
    }

    [Fact]
    public async Task CreateTask_ValidTask_ReturnsCreatedResult()
    {
        // Arrange
        var createDto = new CreateTaskDto
        {
            Title = "New Task",
            DueDate = DateTime.UtcNow.AddDays(1),
            IsImportant = true
        };

        // Act
        var result = await _controller.CreateTask(createDto);

        // Assert
        var actionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var task = Assert.IsType<TaskItem>(actionResult.Value);
        Assert.Equal(createDto.Title, task.Title);
        Assert.Equal(createDto.IsImportant, task.IsImportant);
        Assert.Equal(_testUserId, task.UserId);

        // Verify task was saved
        var savedTask = await _context.TaskItems.FindAsync(task.Id);
        Assert.NotNull(savedTask);
    }

    [Fact]
    public async Task UpdateTask_ExistingTask_ReturnsNoContent()
    {
        // Arrange
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = "Original Title",
            UserId = _testUserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.TaskItems.Add(task);
        await _context.SaveChangesAsync();

        var updateDto = new UpdateTaskDto
        {
            Title = "Updated Title",
            IsCompleted = true
        };

        // Act
        var result = await _controller.UpdateTask(task.Id, updateDto);

        // Assert
        Assert.IsType<NoContentResult>(result);

        // Verify task was updated
        var updatedTask = await _context.TaskItems.FindAsync(task.Id);
        Assert.Equal("Updated Title", updatedTask!.Title);
        Assert.True(updatedTask.IsCompleted);
    }

    [Fact]
    public async Task DeleteTask_ExistingTask_ReturnsNoContent()
    {
        // Arrange
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = "Task to Delete",
            UserId = _testUserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.TaskItems.Add(task);
        await _context.SaveChangesAsync();

        // Act
        var result = await _controller.DeleteTask(task.Id);

        // Assert
        Assert.IsType<NoContentResult>(result);

        // Verify task was deleted
        var deletedTask = await _context.TaskItems.FindAsync(task.Id);
        Assert.Null(deletedTask);
    }

    [Fact]
    public async Task AddStep_ValidStep_ReturnsCreatedResult()
    {
        // Arrange
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = "Task with Steps",
            UserId = _testUserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.TaskItems.Add(task);
        await _context.SaveChangesAsync();

        var createStepDto = new CreateStepDto
        {
            Title = "Step 1"
        };

        // Act
        var result = await _controller.AddStep(task.Id, createStepDto);

        // Assert
        var actionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var step = Assert.IsType<TaskStep>(actionResult.Value);
        Assert.Equal(createStepDto.Title, step.Title);
        Assert.Equal(task.Id, step.TaskItemId);
    }
}
