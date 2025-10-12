using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace EzraBeacon.Api.Authentication;

public class DevAuthenticationSchemeOptions : AuthenticationSchemeOptions { }

public class DevAuthenticationHandler : AuthenticationHandler<DevAuthenticationSchemeOptions>
{
    public DevAuthenticationHandler(
        IOptionsMonitor<DevAuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Create a mock user for development
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "dev-user-123"),
            new Claim("oid", "dev-user-123"), // Object ID claim used by Azure AD
            new Claim(ClaimTypes.Name, "Development User"),
            new Claim(ClaimTypes.Email, "dev@localhost"),
        };

        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
