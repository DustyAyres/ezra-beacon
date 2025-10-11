using System;

namespace EzraBeacon.Core.Entities;

public class TaskStep
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public int Order { get; set; }
    public Guid TaskItemId { get; set; }
    public TaskItem TaskItem { get; set; } = null!;
}
