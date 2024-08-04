namespace ProjectManager.Server
{
    public class Project
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ManagerId { get; set; }
        public AppUser ?Manager { get; set; }
        public ICollection<Task> Tasks { get; set; } = new List<Task>();
        public ICollection<UserInProject> UsersInProjects { get; set; } = new List<UserInProject>();
    }
}