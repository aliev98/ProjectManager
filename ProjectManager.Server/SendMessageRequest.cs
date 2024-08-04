namespace ProjectManager.Server
{
    public class SendMessageRequest
    {
        public string UserId { get; set; } // ID of the user sending the message
        public int ProjectId { get; set; }
        public string Content { get; set; } // The content of the message
    }

}
