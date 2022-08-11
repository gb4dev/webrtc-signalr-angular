import { Client } from "./client";

export class JoinResponse{
    success:boolean = false;
    message:String = "";
    clients: Client[] = [];
}