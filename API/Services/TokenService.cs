using API.Entities;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Identity;

namespace API;

public class TokenService(IConfiguration config, UserManager<AppUser> userManager) : ITokenService
{
	public async Task<string> CreateToken(AppUser user)
	{
		var tokenKey = config["TokenKey"] ?? throw new Exception("TokenKey is missing from appsettings.json");

        if (tokenKey.Length < 64) throw new Exception("TokenKey must be at least 64 characters long");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey));

        if(user.UserName == null) throw new Exception("User must have a username");

        var claims = new List<Claim>
        {
            new (ClaimTypes.Name, user.UserName),
            new (ClaimTypes.NameIdentifier, user.Id.ToString())
        };

        var roles = await userManager.GetRolesAsync(user);
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);

	}
}