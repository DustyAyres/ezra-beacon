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
using EzraBeacon.Api.DTOs;

namespace EzraBeacon.Tests.Controllers;

public class CategoriesControllerTests : IDisposable
{
    private readonly EzraBeaconContext _context;
    private readonly CategoriesController _controller;
    private readonly string _testUserId = "test-user-123";

    public CategoriesControllerTests()
    {
        var options = new DbContextOptionsBuilder<EzraBeaconContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new EzraBeaconContext(options);
        var logger = new Mock<ILogger<CategoriesController>>();
        _controller = new CategoriesController(_context, logger.Object);

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
    public async Task GetCategories_ReturnsOnlyUserCategories()
    {
        // Arrange
        var userCategory = new Category
        {
            Id = Guid.NewGuid(),
            Name = "User Category",
            ColorHex = "#FF0000",
            UserId = _testUserId,
            CreatedAt = DateTime.UtcNow
        };

        var otherUserCategory = new Category
        {
            Id = Guid.NewGuid(),
            Name = "Other User Category",
            ColorHex = "#00FF00",
            UserId = "other-user",
            CreatedAt = DateTime.UtcNow
        };

        _context.Categories.AddRange(userCategory, otherUserCategory);
        await _context.SaveChangesAsync();

        // Act
        var result = await _controller.GetCategories();

        // Assert
        var categories = Assert.IsAssignableFrom<IEnumerable<Category>>(result.Value);
        Assert.Single(categories);
        Assert.Equal(userCategory.Id, categories.First().Id);
    }

    [Fact]
    public async Task GetCategory_ValidId_ReturnsCategory()
    {
        // Arrange
        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = "Test Category",
            ColorHex = "#FF0000",
            UserId = _testUserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        // Act
        var result = await _controller.GetCategory(category.Id);

        // Assert
        var actionResult = Assert.IsType<ActionResult<Category>>(result);
        var returnedCategory = Assert.IsType<Category>(actionResult.Value);
        Assert.Equal(category.Id, returnedCategory.Id);
        Assert.Equal(category.Name, returnedCategory.Name);
    }

    [Fact]
    public async Task GetCategory_InvalidId_ReturnsNotFound()
    {
        // Act
        var result = await _controller.GetCategory(Guid.NewGuid());

        // Assert
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task CreateCategory_ValidCategory_ReturnsCreatedResult()
    {
        // Arrange
        var createDto = new CreateCategoryDto
        {
            Name = "New Category",
            ColorHex = "#0000FF"
        };

        // Act
        var result = await _controller.CreateCategory(createDto);

        // Assert
        var actionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var category = Assert.IsType<Category>(actionResult.Value);
        Assert.Equal(createDto.Name, category.Name);
        Assert.Equal(createDto.ColorHex, category.ColorHex);
        Assert.Equal(_testUserId, category.UserId);

        // Verify category was saved
        var savedCategory = await _context.Categories.FindAsync(category.Id);
        Assert.NotNull(savedCategory);
    }

    [Fact]
    public async Task CreateCategory_DuplicateName_ReturnsBadRequest()
    {
        // Arrange
        var existingCategory = new Category
        {
            Id = Guid.NewGuid(),
            Name = "Existing Category",
            ColorHex = "#FF0000",
            UserId = _testUserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Categories.Add(existingCategory);
        await _context.SaveChangesAsync();

        var createDto = new CreateCategoryDto
        {
            Name = "Existing Category",
            ColorHex = "#00FF00"
        };

        // Act
        var result = await _controller.CreateCategory(createDto);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("Category with this name already exists", badRequestResult.Value);
    }

    [Fact]
    public async Task UpdateCategory_ExistingCategory_ReturnsNoContent()
    {
        // Arrange
        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = "Original Name",
            ColorHex = "#FF0000",
            UserId = _testUserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        var updateDto = new UpdateCategoryDto
        {
            Name = "Updated Name",
            ColorHex = "#00FF00"
        };

        // Act
        var result = await _controller.UpdateCategory(category.Id, updateDto);

        // Assert
        Assert.IsType<NoContentResult>(result);

        // Verify category was updated
        var updatedCategory = await _context.Categories.FindAsync(category.Id);
        Assert.Equal("Updated Name", updatedCategory!.Name);
        Assert.Equal("#00FF00", updatedCategory.ColorHex);
    }

    [Fact]
    public async Task DeleteCategory_ExistingCategory_ReturnsNoContent()
    {
        // Arrange
        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = "Category to Delete",
            ColorHex = "#FF0000",
            UserId = _testUserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        // Act
        var result = await _controller.DeleteCategory(category.Id);

        // Assert
        Assert.IsType<NoContentResult>(result);

        // Verify category was deleted
        var deletedCategory = await _context.Categories.FindAsync(category.Id);
        Assert.Null(deletedCategory);
    }

}
