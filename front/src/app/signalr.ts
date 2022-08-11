import * as signalR from "@microsoft/signalr";
import { Client } from "./models/client";
import { JoinRequest } from "./models/joinRequest";
import { JoinResponse } from "./models/joinResponse";
import { Session } from "./models/session";
export class SignalR {
    connection: signalR.HubConnection;
    sessions: Session[] = [];
    clients: Client[] = [];
    config: any = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" }
        ]
      };
    onMessage: Function | null = null;
    constructor(){
        this.connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5057/appHub")
        .configureLogging(signalR.LogLevel.Information)
        .build();

        this.connection.onclose(async () => {
            
        });

        this.connection.on("OnClientJoin",async (args) => {
            console.log("OnClientJoin", args);
            this.clients.push(args);
        });
        

        this.connection.on("AnswerReceived",(args)=>{
            console.log("AnswerReceived", args);
            let session = this.sessions.find(s=>s.client.clientId == args[1]);
            if(session == null){
                console.log("Erreur answer");
                return;
            }
            let remoteAnswer = new RTCSessionDescription(JSON.parse(args[0]));
            session?.peerConnection.setRemoteDescription(remoteAnswer);
        });

        this.connection.on("OfferReceived",async (args)=>{
            console.log("OfferReceived", args);
            await this.createSession(args[0], args[1]);
        });
        
        this.connection.on("IceCandidateReceived",(args)=>{
            console.log("IceCandidateReceived", args);
            let clientId = args[0];
            let iceCandidate = args[1];
            let session = this.sessions.find(s=>s.client.clientId == clientId);
            iceCandidate = new RTCIceCandidate(JSON.parse(args[1]))
            session?.peerConnection.addIceCandidate(iceCandidate);
        });

        this.connection.on("ClientDisconnected",async (args)=>{
            console.log("ClientDisconnected", args);
            this.sessions = this.sessions.filter(s=>s.client.clientId != args);
        });
    }

    async createSession(offer: string, clientId: string){
        let peerConnection = new RTCPeerConnection();
        let client = this.clients.find(c=>c.clientId == clientId);
        let session: Session = new Session(peerConnection, client!);
        this.sessions.push(session);
        
        let remoteOffer = new RTCSessionDescription(JSON.parse(offer))
        peerConnection.setRemoteDescription(remoteOffer);
        let answer = await peerConnection.createAnswer();
        peerConnection.setLocalDescription(answer);
        
        peerConnection.onicecandidate = (ev)=>{
            console.log("icecandidate", ev);
            if(ev.candidate != null){
                this.connection.send("SendIceCandidate", JSON.stringify(ev.candidate), clientId);
            }
        }
        peerConnection.onconnectionstatechange = (ev)=>{
            console.log("onconnectionstatechange", ev);
        }
        peerConnection.onicecandidateerror = (ev)=>{
            console.log("onicecandidateerror", ev);
        }
        peerConnection.oniceconnectionstatechange = (ev)=>{
            console.log("oniceconnectionstatechange", ev);
        }
        peerConnection.onicegatheringstatechange = (ev)=>{
            console.log("onicegatheringstatechange", ev);
        }
        peerConnection.onsignalingstatechange = (ev)=>{
            console.log("onsignalingstatechange", ev);
        }
        peerConnection.ondatachannel = (e) => {
            session.channel = e.channel;
            session.connected = true;
            e.channel.onmessage = (e) => {
                console.log("Got message:", e.data);
                this.onMessage!(e.data);
            };
        };
        this.connection.send("SendAnswer", JSON.stringify(answer), clientId);
    }

    public async start(userId: string) {
        try {
            await this.connection.start();
            console.log("SignalR Connected.");
           
            let joinRequest = new JoinRequest();
            joinRequest.roomId = "ad81836f-e761-4e9b-97a4-3668e8b26459";
            joinRequest.userId = Number.parseInt(userId);
            const response = await this.connection.invoke("JoinHub", JSON.stringify(joinRequest)) as JoinResponse;
            console.log(response);
            if(response.success){
                this.clients = response.clients;
                this.clients.forEach(async c=>{
                    let peerConnection = new RTCPeerConnection();
                    c.candidates.forEach(can=>{
                        let iceCandidate = new RTCIceCandidate(JSON.parse(can));
                        peerConnection.addIceCandidate(iceCandidate);
                    });
                    peerConnection.onicecandidate = (ev)=>{
                        console.log("icecandidate", ev);
                        if(ev.candidate != null){
                            this.connection.send("SendIceCandidate", JSON.stringify(ev.candidate), c.clientId);
                        }
                    }
                    peerConnection.onconnectionstatechange = (ev)=>{
                        console.log("onconnectionstatechange", ev);
                    }
                    peerConnection.onicecandidateerror = (ev)=>{
                        console.log("onicecandidateerror", ev);
                    }
                    peerConnection.oniceconnectionstatechange = (ev)=>{
                        console.log("oniceconnectionstatechange", ev);
                    }
                    peerConnection.onicegatheringstatechange = (ev)=>{
                        console.log("onicegatheringstatechange", ev);
                    }
                    peerConnection.onsignalingstatechange = (ev)=>{
                        console.log("onsignalingstatechange", ev);
                    }
                    let session: Session = new Session(peerConnection, c);
                    this.sessions.push(session);
                    var channel =session?.peerConnection.createDataChannel("data");
                    session!.channel = channel??null;
                    channel.onerror = function (err) {
                        console.error("Channel Error:", err);
                    };
                    channel.onmessage = (e) => {
                        console.log("Got message:", e);
                        this.onMessage!(e.data);
                    }
                    channel.onopen = function(ev){
                        console.log("Channel Oppen:", ev);
                        session.connected = true;
                    }
                    channel.onclose = function(ev){
                        console.log("Channel Close:", ev);
                    }
                    let offer = await peerConnection.createOffer();
                    peerConnection.setLocalDescription(offer);
                    this.connection.send("SendOffer", JSON.stringify(offer), c.clientId);
                });
            }
        } catch (err) {
            console.error(err);
        }
    };
}