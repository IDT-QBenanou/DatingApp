using System.Security.Claims;

namespace API.Extensions
{
    public static class ClaimsPrincipleExtensions
    {
        public static string GetUsername(this ClaimsPrincipal user)
        {
            var username = user.FindFirst(ClaimTypes.Name)?.Value;
            if(username == null) throw new System.Exception("Username not found");

            return username;
        }

        public static int GetUserId(this ClaimsPrincipal user)
        {
            var userIdValue = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdValue == null) throw new System.Exception("ID not found");
            
            var userId = int.Parse(userIdValue);

            return userId;
        }
    }
}