using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using EzraBeacon.Infrastructure.Data;
using EzraBeacon.Api.Authentication;
using Swashbuckle.AspNetCore.Filters;

var builder = WebApplication.CreateBuilder(args);

// Check if development auth bypass is enabled
var bypassAuth = builder.Configuration.GetValue<bool>("Development:BypassAuthentication");

// Add services to the container.
if (!bypassAuth)
{
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));
}
else
{
    // Add a dummy authentication scheme for development
    builder.Services.AddAuthentication("DevAuth")
        .AddScheme<DevAuthenticationSchemeOptions, DevAuthenticationHandler>("DevAuth", null);
}

builder.Services.AddAuthorization();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000", "http://frontend")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
});

// Add Entity Framework
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=ezra.db";

// Add this after getting the connection string
if (builder.Environment.IsDevelopment() &&
    Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true")
{
    // Running in Docker during development - use a local path
    connectionString = "Data Source=/tmp/ezra-dev.db";
}

builder.Services.AddDbContext<EzraBeaconContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Add this line to register Swagger examples
builder.Services.AddSwaggerExamplesFromAssemblyOf<Program>();

// Configure Swagger/OpenAPI
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Ezra Beacon API",
        Version = "v1",
        Description = "A personal task management API with support for categories, recurring tasks, and subtasks.",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "Ezra Beacon Team",
            Email = "support@ezrabeacon.com"
        },
        License = new Microsoft.OpenApi.Models.OpenApiLicense
        {
            Name = "MIT License",
            Url = new Uri("https://opensource.org/licenses/MIT")
        }
    });

    // Add security definition
    if (!bypassAuth)
    {
        options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
            Name = "Authorization",
            In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT"
        });

        options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
        {
            {
                new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Reference = new Microsoft.OpenApi.Models.OpenApiReference
                    {
                        Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
    }
    else
    {
        options.AddSecurityDefinition("DevAuth", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Description = "Development authentication bypass. Use any bearer token value (e.g., 'dev-token').",
            Name = "Authorization",
            In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
            Scheme = "bearer"
        });

        options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
        {
            {
                new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Reference = new Microsoft.OpenApi.Models.OpenApiReference
                    {
                        Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                        Id = "DevAuth"
                    }
                },
                Array.Empty<string>()
            }
        });
    }

    // Include XML comments if available
    var xmlFilename = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }

    // Add example filters for better documentation
    options.ExampleFilters();
});

var app = builder.Build();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<EzraBeaconContext>();
    context.Database.EnsureCreated();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Ezra Beacon API v1");
        options.RoutePrefix = string.Empty; // Serve Swagger UI at the app's root
        options.DocumentTitle = "Ezra Beacon API Documentation";
        options.EnableDeepLinking();
        options.EnableFilter();
        options.ShowExtensions();
        options.EnableValidator();
        options.DisplayRequestDuration();
    });
}

app.UseCors("AllowFrontend");
app.UseAuthentication();

if (bypassAuth)
{
    // Log that we're in development mode
    app.Logger.LogWarning("⚠️ DEVELOPMENT MODE: Authentication is bypassed. DO NOT use in production!");
}

app.UseAuthorization();

app.MapControllers();

app.Run();
