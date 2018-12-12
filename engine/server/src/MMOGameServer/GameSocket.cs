using Fleck;
using MMOLibrary;
using MMOLibrary.Model;
using System;
using System.Collections.Generic;
using System.Text;

namespace MMOGameServer
{
    public class GameSocket : AuthSocket
    {
        public Character SelectedCharacter { get; set; }

        public GameSocket(Account account, IWebSocketConnection socket, Character selectedCharacter)
        {
            this.Account = account;
            this.Socket = socket;
            this.SelectedCharacter = selectedCharacter;            
            this.Socket.OnMessage = message => GameSocketEventHandler.OnMessage(this, message);
            this.Socket.OnError = message => GameSocketEventHandler.OnClose(this);
            this.Socket.OnClose = () => GameSocketEventHandler.OnClose(this);
            this.SelectedCharacter.GameSocket = this;
        }

        public override void Notify(string msg)
        {
            this.Socket.Send(msg);
        }


    }
}
