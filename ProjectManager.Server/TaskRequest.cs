namespace ProjectManager.Server
{
    public class TaskRequest
    {
        public string Description { get; set; }
        public string UserId { get; set; }
        public DateTime DueDate { get; set; } // Ensure the type matches what you expect
        public int ProjectId { get; set; }
        public bool IsCompleted { get; set; } = false; // Default to false
    }

}
