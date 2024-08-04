using Microsoft.AspNetCore.Identity;

namespace ProjectManager.Server
{
    public class AppUser : IdentityUser
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public ICollection<UserInProject> UsersInProjects { get; set; } = new List<UserInProject>();
    }
}