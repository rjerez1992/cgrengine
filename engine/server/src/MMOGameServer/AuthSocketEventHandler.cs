using System;
using System.Collections.Generic;
using System.Text;
using Fleck;
using Newtonsoft.Json;
using Serilog;
using MMOLibrary;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using MMOLibrary.Model;

namespace MMOGameServer
{
    class AuthSocketEventHandler
    {
        static public void OnMessage(AuthSocket authSocket, string msg)
        {
            Log.Information("AuthSocket > " + msg + " from host " + authSocket.Socket.ConnectionInfo.ClientIpAddress);
            if (msg.StartsWith("client.request.account"))
            {
                authSocket.Socket.Send("server.account.info|" + JsonConvert.SerializeObject(authSocket.Account));
            }
            else if (msg.StartsWith("client.request.classes"))
            {
                using (Database DataContext = new Database(Program.Configuration["database:connection-string"]))
                {
                    List<Class> classes = DataContext.Classes.ToList();
                    authSocket.Socket.Send("server.game.classes|" + JsonConvert.SerializeObject(classes));
                }
            }
            else if (msg.StartsWith("client.character.create"))
            {
                using (Database DataContext = new Database(Program.Configuration["database:connection-string"]))
                {
                    string[] arguments = msg.Split("|");
                    string charName = arguments[1];
                    string classId = arguments[2];

                    //Checks
                    Character tmp = DataContext.Characters.FirstOrDefault(chr => chr.Name == charName);
                    if (tmp != null) {
                        authSocket.Socket.Send("server.character.notcreated");
                        return;
                    }
                    Character c = new Character(charName, DataContext.Classes.Find(classId));
                    Account acc = DataContext.Accounts.Include("Characters.Class").SingleOrDefault(ax => ax.AccountId == authSocket.Account.AccountId);
                    acc.Characters.Add(c); //Required to update asap
                    authSocket.Account.Characters.Add(c);
                    DataContext.SaveChanges();
                    authSocket.Socket.Send("server.character.created");
                }
            }
            else if (msg.StartsWith("client.character.delete"))
            {
                using (Database DataContext = new Database(Program.Configuration["database:connection-string"]))
                {
                    string[] arguments = msg.Split("|");
                    string charId = arguments[1];
                   
                    Account acc = DataContext.Accounts.Include("Characters.Class").SingleOrDefault(ax => ax.AccountId == authSocket.Account.AccountId);
                    Character chr = acc.Characters.FirstOrDefault(ch => ch.CharacterId == charId);
                    authSocket.Account.Characters.Remove(authSocket.Account.Characters.FirstOrDefault(ch => ch.CharacterId == charId));
                    acc.Characters.Remove(chr);
                    DataContext.Characters.Remove(chr);
                    DataContext.SaveChanges();
                    authSocket.Socket.Send("server.character.deleted");
                }
            }
            else if (msg.StartsWith("client.character.select"))
            {
                using (Database DataContext = new Database(Program.Configuration["database:connection-string"]))
                {
                    string[] arguments = msg.Split("|");
                    string charId = arguments[1];

                    Character chr = authSocket.Account.Characters.SingleOrDefault(cx => cx.CharacterId == charId);
                    if (chr == null) {
                        authSocket.Socket.Send("server.character.selectionerror");
                        return;
                    }
                    //Socket upgrade
                    GameSocket gsock = new GameSocket(authSocket.Account, authSocket.Socket, chr);
                    Network.AuthedConnections.Remove(authSocket);
                    Network.GamingConnections.Add(gsock);
                    gsock.Socket.Send("server.character.selected");
                    AddCharacterToSimulation(chr);
                }
            }
        }

        private static void AddCharacterToSimulation(Character chr)
        {
            //Sets the map id and coordinates if none are set
            if (chr.CurrentMapId == null) {
                chr.CurrentMapId = Program.SimulatedMaps.FirstOrDefault(sm => true).Map.MapId;         
            }
            Program.SimulatedMaps.FirstOrDefault(sm => sm.Map.MapId == chr.CurrentMapId).AddCharacterToSimulation(chr);
        }


        static public void OnClose(AuthSocket asock)
        {
            Network.AuthedConnections.Remove(asock);
        }
    }
}
