namespace ProjectManager.Server
{
    public class Task
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public DateTime? DueDate { get; set; }
        public bool ?IsCompleted { get; set; }
        public int ProjectId { get; set; }
        public Project Project { get; set; }
        public string AssignedToId {  get; set; }
        public AppUser AssignedTo { get; set; }
    }
}