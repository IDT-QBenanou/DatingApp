using System.Security.Claims;

namespace API.Extensions
{
    public static class ClaimsPrincipleExtensions
    {
        public static string GetUsername(this ClaimsPrincipal user)
        {
            var username = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if(username == null) throw new System.Exception("Username not found");

            return username;
        }
    }
}