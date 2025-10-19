using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;
using EzraBeacon.Api.Authentication;

namespace EzraBeacon.Tests.Authentication;

public class DevAuthenticationHandlerTests
{
    private readonly Mock<IOptionsMonitor<DevAuthenticationSchemeOptions>> _options;
    private readonly Mock<ILoggerFactory> _loggerFactory;
    private readonly Mock<UrlEncoder> _encoder;
    private readonly DevAuthenticationHandler _handler;
    private readonly HttpContext _context;

    public DevAuthenticationHandlerTests()
    {
        _options = new Mock<IOptionsMonitor<DevAuthenticationSchemeOptions>>();
        _options.Setup(o => o.Get(It.IsAny<string>())).Returns(new DevAuthenticationSchemeOptions());

        _loggerFactory = new Mock<ILoggerFactory>();
        _loggerFactory.Setup(x => x.CreateLogger(It.IsAny<string>())).Returns(new Mock<ILogger>().Object);

        _encoder = new Mock<UrlEncoder>();

        _context = new DefaultHttpContext();

        _handler = new DevAuthenticationHandler(_options.Object, _loggerFactory.Object, _encoder.Object);

        var scheme = new AuthenticationScheme("Dev", "Dev", typeof(DevAuthenticationHandler));
        _handler.InitializeAsync(scheme, _context).Wait();
    }

    [Fact]
    public async Task HandleAuthenticateAsync_ReturnsSuccessWithDevUser()
    {
        // Act
        var result = await _handler.AuthenticateAsync();

        // Assert
        Assert.True(result.Succeeded);
        Assert.NotNull(result.Principal);
        
        var claims = result.Principal.Claims;
        Assert.Contains(claims, c => c.Type == ClaimTypes.NameIdentifier && c.Value == "dev-user-123");
        Assert.Contains(claims, c => c.Type == "oid" && c.Value == "dev-user-123");
        Assert.Contains(claims, c => c.Type == ClaimTypes.Name && c.Value == "Development User");
        Assert.Contains(claims, c => c.Type == ClaimTypes.Email && c.Value == "dev@localhost");
    }

    [Fact]
    public async Task HandleAuthenticateAsync_AlwaysSucceeds()
    {
        // Act - Call multiple times to ensure it always succeeds
        var result1 = await _handler.AuthenticateAsync();
        var result2 = await _handler.AuthenticateAsync();
        var result3 = await _handler.AuthenticateAsync();

        // Assert
        Assert.True(result1.Succeeded);
        Assert.True(result2.Succeeded);
        Assert.True(result3.Succeeded);
    }
}
