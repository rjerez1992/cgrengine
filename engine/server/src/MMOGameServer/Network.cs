using System;
using System.Collections.Generic;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using Fleck;
using Microsoft.Extensions.Configuration;
using Serilog;

namespace MMOGameServer
{
    class Network
    {

        static public List<AuthSocket> AuthedConnections = new List<AuthSocket>();
        static public List<IWebSocketConnection> Connections = new List<IWebSocketConnection>();
        static public List<GameSocket> GamingConnections = new List<GameSocket>();

        private string _serverIp { get; set; }
        private string _serverPort { get; set; }
        public WebSocketServer Server { get; set; }

        public Network(IConfiguration configuration)
        {
            this._serverIp = configuration["network:server-ip"];
            this._serverPort = configuration["network:server-port"];
            //this.Connections = new List<IWebSocketConnection>();
            this.RedirectLogInformation();
            this.StartSocketServer();
        }

        private void RedirectLogInformation()
        {
            FleckLog.LogAction = (level, message, exception) =>
            {
                //Log.Information(message);
            };
        }

        private void StartSocketServer()
        {
            Log.Information("Starting socket server at ws://" + this._serverIp + ":" + this._serverPort);
            //Log.Warning("Server is configured to use an unsafe connection");
            //TODO:Change to wss for production
            this.Server = new WebSocketServer("ws://" + this._serverIp + ":" + this._serverPort);
            //this.Server.Certificate = new X509Certificate2("C:/test.pfx");
            this.Server.ListenerSocket.NoDelay = true;
            //this.Server.RestartAfterListenError = true;
            this.Server.Start(socket =>
            {
                Network.Connections.Add(socket);
                socket.OnOpen = () => SocketEventHandler.OnOpen(socket);
                socket.OnClose = () => SocketEventHandler.OnClose(socket);
                socket.OnMessage = message => SocketEventHandler.OnMessage(socket, message);
            });
        }
    }
}
