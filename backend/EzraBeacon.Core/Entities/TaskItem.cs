using System;
using System.Collections.Generic;

namespace EzraBeacon.Core.Entities;

public class TaskItem
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public bool IsImportant { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string UserId { get; set; } = string.Empty;

    // Recurrence
    public RecurrenceType? RecurrenceType { get; set; }
    public string? CustomRecurrencePattern { get; set; }

    // Navigation properties
    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }
    public List<TaskStep> Steps { get; set; } = new();
}

public enum RecurrenceType
{
    None,
    Daily,
    Weekdays,
    Weekly,
    Monthly,
    Yearly,
    Custom
}
