using System;
using Xunit;
using EzraBeacon.Api.DTOs;
using EzraBeacon.Core.Entities;

namespace EzraBeacon.Tests.DTOs;

public class TaskDtosTests
{
    [Fact]
    public void CreateTaskDto_GetExamples_ReturnsValidExample()
    {
        // Arrange
        var dto = new CreateTaskDto();

        // Act
        var example = dto.GetExamples();

        // Assert
        Assert.NotNull(example);
        Assert.Equal("Review project documentation", example.Title);
        Assert.True(example.IsImportant);
        Assert.NotNull(example.DueDate);
        Assert.NotNull(example.CategoryId);
        Assert.Null(example.RecurrenceType);
    }

    [Fact]
    public void UpdateTaskDto_GetExamples_ReturnsValidExample()
    {
        // Arrange
        var dto = new UpdateTaskDto();

        // Act
        var example = dto.GetExamples();

        // Assert
        Assert.NotNull(example);
        Assert.Equal("Updated task title", example.Title);
        Assert.False(example.IsImportant);
        Assert.True(example.IsCompleted);
    }

    [Fact]
    public void TaskCountsDto_Properties_SetCorrectly()
    {
        // Arrange & Act
        var counts = new TaskCountsDto
        {
            MyDay = 5,
            Important = 3,
            Planned = 10,
            All = 15
        };

        // Assert
        Assert.Equal(5, counts.MyDay);
        Assert.Equal(3, counts.Important);
        Assert.Equal(10, counts.Planned);
        Assert.Equal(15, counts.All);
    }

    [Fact]
    public void CreateStepDto_GetExamples_ReturnsValidExample()
    {
        // Arrange
        var dto = new CreateStepDto();

        // Act
        var example = dto.GetExamples();

        // Assert
        Assert.NotNull(example);
        Assert.Equal("Draft initial outline", example.Title);
    }

    [Fact]
    public void UpdateStepDto_GetExamples_ReturnsValidExample()
    {
        // Arrange
        var dto = new UpdateStepDto();

        // Act
        var example = dto.GetExamples();

        // Assert
        Assert.NotNull(example);
        Assert.Equal("Updated step title", example.Title);
        Assert.True(example.IsCompleted);
    }
}
