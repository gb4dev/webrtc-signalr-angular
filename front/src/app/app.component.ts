import { Component } from '@angular/core';
import { SignalR } from './signalr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'front';
  userId:string = "";
  text: string = "";
  messages: string[] = [];

  signalr: SignalR = new SignalR();
  constructor(){
    this.signalr.onMessage = this.onMessageReceived;
  }

    async connect(){
      await this.signalr.start(this.userId);
    }

    async sendMessage(){
      await this.signalr.sessions.forEach(s=>{
        if(s.connected)
        s.channel?.send(this.text)
      });
    }

    onMessageReceived = (message: string) => {
      console.log("alooo", message);
      this.messages.push(message);
      this.messages = [...this.messages];
    }
}
