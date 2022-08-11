namespace Webrtc.Models
{
    public class JoinResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public List<Client> clients { get; set; }
    }
}
