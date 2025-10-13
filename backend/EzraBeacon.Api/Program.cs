using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using EzraBeacon.Infrastructure.Data;
using EzraBeacon.Api.Authentication;

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
builder.Services.AddDbContext<EzraBeaconContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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
    app.UseSwaggerUI();
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
