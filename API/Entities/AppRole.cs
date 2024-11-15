using Microsoft.AspNetCore.Identity;

namespace API;


public class AppRole : IdentityRole<int>
{
    public AppRole() { }
    public AppRole(string roleName) : base(roleName) { }

    public ICollection<AppUserRole> UserRoles { get; set; } = [];
}