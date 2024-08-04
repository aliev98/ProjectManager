namespace ProjectManager.Server
{
    public class UserInProject
    {
        public Project Project { get; set; }
        public AppUser User { get; set; }
        public int ProjectId { get; set; }
        public string UserId { get; set; }
    }
}
