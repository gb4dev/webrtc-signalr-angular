using Newtonsoft.Json;

namespace Webrtc.Models
{
    public class IceCandidate
    {
        [JsonProperty("sdp")]
        public string Sdp { get; }

        [JsonProperty("sdpMid")]
        public string SdpMid { get; }

        [JsonProperty("sdpMLineIndex")]
        public int SdpMLineIndex { get; }

        public IceCandidate(string sdp, string sdpMid, int sdpMLineIndex)
        {
            Sdp = sdp;
            SdpMid = sdpMid;
            SdpMLineIndex = sdpMLineIndex;
        }

        public static IceCandidate RecreateIceCandidate(string _json)
        {
            var jsonDict = JsonConvert.DeserializeObject<Dictionary<string, string>>(_json);
            if (jsonDict["type"].Equals("candidate"))
            {
                int.TryParse(jsonDict["label"], out int label);
                return new IceCandidate(jsonDict["candidate"], jsonDict["id"], label);
            }

            return null;
        }
    }
}
