using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Filters;

namespace EzraBeacon.Api.DTOs;

/// <summary>
/// Data transfer object for creating a new category
/// </summary>
public class CreateCategoryDto : IExamplesProvider<CreateCategoryDto>
{
    /// <summary>
    /// The name of the category
    /// </summary>
    /// <example>Work Projects</example>
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// The color associated with this category (hex format)
    /// </summary>
    /// <example>#FF5733</example>
    [Required]
    [RegularExpression("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "Color must be a valid hex color code")]
    public string ColorHex { get; set; } = "#0078D4";

    public CreateCategoryDto GetExamples()
    {
        return new CreateCategoryDto
        {
            Name = "Personal Tasks",
            ColorHex = "#4CAF50"
        };
    }
}

/// <summary>
/// Data transfer object for updating an existing category
/// </summary>
public class UpdateCategoryDto : IExamplesProvider<UpdateCategoryDto>
{
    /// <summary>
    /// The updated name of the category
    /// </summary>
    /// <example>Work Projects - Updated</example>
    [MaxLength(100)]
    public string? Name { get; set; }

    /// <summary>
    /// The updated color for the category (hex format)
    /// </summary>
    /// <example>#33FF57</example>
    [RegularExpression("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "Color must be a valid hex color code")]
    public string? ColorHex { get; set; }

    public UpdateCategoryDto GetExamples()
    {
        return new UpdateCategoryDto
        {
            Name = "Updated Category Name",
            ColorHex = "#2196F3"
        };
    }
}
