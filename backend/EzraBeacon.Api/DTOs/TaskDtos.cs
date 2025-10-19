using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Filters;
using EzraBeacon.Core.Entities;

namespace EzraBeacon.Api.DTOs;

/// <summary>
/// Data transfer object for task count statistics
/// </summary>
public class TaskCountsDto
{
    /// <summary>
    /// Number of tasks due today
    /// </summary>
    /// <example>5</example>
    public int MyDay { get; set; }
    
    /// <summary>
    /// Number of tasks marked as important
    /// </summary>
    /// <example>3</example>
    public int Important { get; set; }
    
    /// <summary>
    /// Number of tasks with a future due date
    /// </summary>
    /// <example>7</example>
    public int Planned { get; set; }
    
    /// <summary>
    /// Total number of all active tasks
    /// </summary>
    /// <example>15</example>
    public int All { get; set; }
}

/// <summary>
/// Data transfer object for creating a new task
/// </summary>
public class CreateTaskDto : IExamplesProvider<CreateTaskDto>
{
    /// <summary>
    /// The title of the task
    /// </summary>
    /// <example>Complete quarterly report</example>
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;
    
    /// <summary>
    /// The due date for the task
    /// </summary>
    /// <example>2024-12-31</example>
    public DateTime? DueDate { get; set; }
    
    /// <summary>
    /// Whether this task is marked as important
    /// </summary>
    /// <example>true</example>
    public bool IsImportant { get; set; }
    
    /// <summary>
    /// The recurrence pattern for the task
    /// </summary>
    /// <example>0</example>
    public RecurrenceType? RecurrenceType { get; set; }
    
    /// <summary>
    /// Custom recurrence pattern (if RecurrenceType is Custom)
    /// </summary>
    /// <example>Every 2 weeks on Monday and Friday</example>
    public string? CustomRecurrencePattern { get; set; }
    
    /// <summary>
    /// The category ID this task belongs to
    /// </summary>
    /// <example>123e4567-e89b-12d3-a456-426614174000</example>
    public Guid? CategoryId { get; set; }

    public CreateTaskDto GetExamples()
    {
        return new CreateTaskDto
        {
            Title = "Review project documentation",
            DueDate = DateTime.UtcNow.AddDays(3),
            IsImportant = true,
            RecurrenceType = null,
            CategoryId = Guid.Parse("3fa85f64-5717-4562-b3fc-2c963f66afa6")
        };
    }
}

/// <summary>
/// Data transfer object for updating an existing task
/// </summary>
public class UpdateTaskDto : IExamplesProvider<UpdateTaskDto>
{
    /// <summary>
    /// The updated title of the task
    /// </summary>
    /// <example>Complete quarterly report - REVISED</example>
    [MaxLength(255)]
    public string? Title { get; set; }
    
    /// <summary>
    /// The updated due date for the task
    /// </summary>
    /// <example>2024-12-30</example>
    public DateTime? DueDate { get; set; }
    
    /// <summary>
    /// Whether this task is marked as important
    /// </summary>
    /// <example>false</example>
    public bool? IsImportant { get; set; }
    
    /// <summary>
    /// Whether this task is completed
    /// </summary>
    /// <example>true</example>
    public bool? IsCompleted { get; set; }
    
    /// <summary>
    /// The recurrence pattern for the task
    /// </summary>
    /// <example>2</example>
    public RecurrenceType? RecurrenceType { get; set; }
    
    /// <summary>
    /// Custom recurrence pattern (if RecurrenceType is Custom)
    /// </summary>
    /// <example>Every month on the 15th</example>
    public string? CustomRecurrencePattern { get; set; }
    
    /// <summary>
    /// The category ID this task belongs to
    /// </summary>
    /// <example>123e4567-e89b-12d3-a456-426614174000</example>
    public Guid? CategoryId { get; set; }

    public UpdateTaskDto GetExamples()
    {
        return new UpdateTaskDto
        {
            Title = "Updated task title",
            IsCompleted = true,
            IsImportant = false
        };
    }
}

/// <summary>
/// Data transfer object for creating a task step
/// </summary>
public class CreateStepDto : IExamplesProvider<CreateStepDto>
{
    /// <summary>
    /// The title of the step
    /// </summary>
    /// <example>Research competitor pricing</example>
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    public CreateStepDto GetExamples()
    {
        return new CreateStepDto
        {
            Title = "Draft initial outline"
        };
    }
}

/// <summary>
/// Data transfer object for updating a task step
/// </summary>
public class UpdateStepDto : IExamplesProvider<UpdateStepDto>
{
    /// <summary>
    /// The updated title of the step
    /// </summary>
    /// <example>Research competitor pricing - COMPLETED</example>
    [MaxLength(255)]
    public string? Title { get; set; }
    
    /// <summary>
    /// Whether this step is completed
    /// </summary>
    /// <example>true</example>
    public bool? IsCompleted { get; set; }

    public UpdateStepDto GetExamples()
    {
        return new UpdateStepDto
        {
            Title = "Updated step title",
            IsCompleted = true
        };
    }
}
