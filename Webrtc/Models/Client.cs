namespace Webrtc.Models
{
    public class Client
    {
        public int UserId { get; set; }
        public string ClientId { get; set; }
        public Guid RoomId { get; set; }
        public List<string> Candidates { get; set; } = new List<string>();
    }
}
