namespace Webrtc.Models
{
    public static class HubObjects
    {
        public static Dictionary<string, Client> Clients { get; set; } = new Dictionary<string, Client>();
        public static Dictionary<string, Room> Rooms { get; set; } = new Dictionary<string, Room>();
    }
}
