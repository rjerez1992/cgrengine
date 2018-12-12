using Fleck;
using MMOLibrary;
using MMOLibrary.Model;
using System;
using System.Collections.Generic;
using System.Text;

namespace MMOGameServer
{
    public class AuthSocket : NetworkInstance
    {
        public Account Account { get; set; }
        public IWebSocketConnection Socket { get; set; }

        public AuthSocket() { }

        public AuthSocket(Account account, IWebSocketConnection socket)
        {
            Account = account;
            Socket = socket;
            this.Socket.OnMessage = message => AuthSocketEventHandler.OnMessage(this, message);
            this.Socket.OnError = message => AuthSocketEventHandler.OnClose(this);
            this.Socket.OnClose = () => AuthSocketEventHandler.OnClose(this);
        }

        public override void Notify(string msg)
        {
            this.Socket.Send(msg);
        }
    }
}
