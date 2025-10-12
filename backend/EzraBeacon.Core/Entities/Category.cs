using System;
using System.Collections.Generic;

namespace EzraBeacon.Core.Entities;

public class Category
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ColorHex { get; set; } = "#ffcf33"; // Default yellow color
    public string UserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    
    // Navigation properties
    public List<TaskItem> TaskItems { get; set; } = new();
}
