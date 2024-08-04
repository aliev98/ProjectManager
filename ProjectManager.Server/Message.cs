namespace ProjectManager.Server
{
    public class Message
    {
        public int Id { get; set; }
        public string SenderUserId { get; set; }
        public string Content { get; set; }
        public DateTime SentAt { get; set; }
        public int ProjectId { get; set; } // Project ID associated with the message
        public AppUser Sender { get; set; } // Navigation property
        public Project Project { get; set; } // Navigation property
    }
}