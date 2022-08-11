namespace Webrtc.Models
{
    public class Room
    {
        public Guid Id { get; set; }
        public List<Client> Clients { get; set; } = new List<Client>();
    }
}
