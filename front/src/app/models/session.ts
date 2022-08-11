import { Client } from "./client";

export class Session {
    peerConnection: RTCPeerConnection;
    client: Client;
    channel: RTCDataChannel | null = null;
    connected: boolean = false;

    constructor(peerConnection: RTCPeerConnection, client: Client){
        this.peerConnection = peerConnection;
        this.client = client;
    }
}