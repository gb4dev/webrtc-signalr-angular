using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using Webrtc.Models;

namespace Webrtc
{
    public class AppHub : Hub
    {
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            HubObjects.Clients.TryGetValue(Context.ConnectionId, out Client client);
            if (client == null)
            {
                Console.WriteLine("Déconnection du client impossible, non trouvé");
                return;
            }
            HubObjects.Rooms.TryGetValue(client.RoomId.ToString(), out Room room);
            if (room == null)
            {
                Console.WriteLine("Romm non trouvé");
                return;
            }
            await Clients.Clients(room.Clients.Select(c => c.ClientId)).SendAsync("ClientDisconnected", client.ClientId);
            room.Clients.RemoveAll(c=>c.ClientId == client.ClientId);
            HubObjects.Rooms[room.Id.ToString()] = room;
            HubObjects.Clients.Remove(Context.ConnectionId);

            await base.OnDisconnectedAsync(exception);
        }

        public async Task<JoinResponse> JoinHub(string joinHubRequestJson)
        {
            JoinHubRequest request = JsonConvert.DeserializeObject<JoinHubRequest>(joinHubRequestJson);
            var response = new JoinResponse();
            if(request == null)
            {
                response.Message = "Bad request";
                response.Success = false;
                return response;
            }
            if (!HubObjects.Clients.ContainsKey(Context.ConnectionId))
            {
                HubObjects.Rooms.TryGetValue(request.RoomId.ToString(), out Room room);
                if (room != null)
                {
                    if (room.Clients.All(c => c.ClientId != Context.ConnectionId && c.UserId != request.UserId))
                    {
                        var client = new Client()
                        {
                            UserId = request.UserId,
                            ClientId = Context.ConnectionId,
                            RoomId = request.RoomId
                        };
                        HubObjects.Clients[client.ClientId] = client;
                        room.Clients.Add(client);
                        response.Success = true;
                        response.clients = room.Clients.Where(c=>c.ClientId != Context.ConnectionId).ToList();
                        await Clients.Clients(response.clients.Select(c => c.ClientId)).SendAsync("OnClientJoin", client);
                        return response;
                    }
                    response.Success = false;
                    response.Message = "Le client est dajà dans la room";
                    return response;
                }
                response.Success = false;
                response.Message = "La room n'existe pas";
                return response;
            }
            response.Success = false;
            response.Message = "Le client est pas connecté";
            return response;
        }

        public async Task SendAnswer(string answer, string clientId)
        {
            HubObjects.Clients.TryGetValue(Context.ConnectionId, out Client client);
            if(client != null)
            {
                HubObjects.Rooms.TryGetValue(client.RoomId.ToString(), out Room room);
                if(room != null)
                {
                    await Clients.Client(clientId).SendAsync("AnswerReceived", new List<object>() { answer, Context.ConnectionId });
                }
            }
        }

        public async Task SendOffer(string offer, string clientId)
        {
            HubObjects.Clients.TryGetValue(Context.ConnectionId, out Client client);
            if (client != null)
            {
                HubObjects.Rooms.TryGetValue(client.RoomId.ToString(), out Room room);
                if (room != null)
                {
                    await Clients.Client(clientId).SendAsync("OfferReceived", new List<object>() { offer, Context.ConnectionId });
                }
            }
        }

        public async Task SendIceCandidate(string iceCandidate, string clientId)
        {
            HubObjects.Clients.TryGetValue(Context.ConnectionId, out Client client);
            if (client != null)
            {
                HubObjects.Rooms.TryGetValue(client.RoomId.ToString(), out Room room);
                if (room != null)
                {
                    client.Candidates.Add(iceCandidate);
                    await Clients.Client(clientId).SendAsync("IceCandidateReceived", new List<object>() { client.ClientId, iceCandidate });
                }
            }
        }
    }
}
