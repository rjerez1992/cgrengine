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
    class SocketEventHandler
    {
        static public void OnMessage(IWebSocketConnection socket, string msg)
        {
            Log.Information("Message " + msg + " from host " + socket.ConnectionInfo.ClientIpAddress);
            if (msg.StartsWith("game.currentmap.request"))
            {
                using (Database DataContext = new Database(Program.Configuration["database:connection-string"]))
                {
                    Map[] mi = DataContext.Maps.ToArray();
                    string json = JsonConvert.SerializeObject(mi);
                    //Console.WriteLine(json);
                    socket.Send("currentmap.data|" + json);
                }
            }
            else if (msg.StartsWith("editor.zones.list"))
            {
                using (Database DataContext = new Database(Program.Configuration["database:connection-string"]))
                {
                    Zone[] zones = DataContext.Zones.ToArray();
                    string json = JsonConvert.SerializeObject(zones);
                    socket.Send("zones.list|" + json);
                }
            }
            else if (msg.StartsWith("editor.zones.delete"))
            {
                string[] arguments = msg.Split("|");
                using (Database DataContext = new Database(Program.Configuration["database:connection-string"]))
                {
                    Zone zone = new Zone { ZoneId = arguments[1] };
                    DataContext.Zones.Attach(zone);
                    DataContext.Zones.Remove(zone);
                    DataContext.SaveChanges();
                }
                socket.Send("zone.deleted");
                //TODO: Reload zones
            }
            else if (msg.StartsWith("editor.zones.new"))
            {
                string[] arguments = msg.Split("|");
                int newZoneSize = 0;
                Int32.TryParse(arguments[2], out newZoneSize);

                using (Database DataContext = new Database(Program.Configuration["database:connection-string"]))
                {
                    Zone zone = new Zone(arguments[1], newZoneSize);
                    DataContext.Zones.Add(zone);
                    DataContext.SaveChanges();
                }
                socket.Send("zone.created");
                //TODO: Reload zones
            }
            else if (msg.StartsWith("editor.zone.map.new"))
            {
                string[] arguments = msg.Split("|");
                int rowIndex = 0;
                int columnIndex = 0;
                string newMapJson = "";
                Int32.TryParse(arguments[2], out rowIndex);
                Int32.TryParse(arguments[3], out columnIndex);

                using (Database DataContext = new Database(Program.Configuration["database:connection-string"]))
                {
                    Zone zone = DataContext.Zones.SingleOrDefault(z => z.ZoneId == arguments[1]);
                    Map m = new Map(arguments[4], 32);
                    DataContext.Maps.Add(m);
                    DataContext.SaveChanges();
                    zone.SetMapAt(m, rowIndex, columnIndex);
                    DataContext.SaveChanges();
                    newMapJson = JsonConvert.SerializeObject(m);
                }
                socket.Send("map.created|" + newMapJson);
                //TODO: Reload zones and maps
            }
            else if (msg.StartsWith("editor.map.update"))
            {
                string[] arguments = msg.Split("|");
                Map m = JsonConvert.DeserializeObject<Map>(arguments[1]);
                Console.WriteLine(m.ToString());
                Console.WriteLine(m.Name);
                using (Database DataContext = new Database(Program.Configuration["database:connection-string"]))
                {
                    Map oldMap = DataContext.Maps.Find(m.MapId);
                    DataContext.Entry(oldMap).CurrentValues.SetValues(m);
                    DataContext.SaveChanges();
                }
                socket.Send("server.map.updated");
            }
            else if (msg.StartsWith("client.socket.auth"))
            {
                //Disables login while on edition mode.
                if (Program.EditionMode) {
                    socket.Send("server.socket.notok");
                    return;
                }

                string[] arguments = msg.Split("|");
                string username = arguments[1];
                string token = arguments[2];
                using (Database DataContext = new Database(Program.Configuration["database:connection-string"]))
                {
                    Account a = DataContext.Accounts.Include("Characters.Class").SingleOrDefault(acc => acc.Username == username);
                    if (a == null)
                    {
                        socket.Send("server.socket.error");
                    }
                    else if (a.Token.Equals(token))
                    {                        
                        AuthSocket duplicated = null;
                        foreach (AuthSocket asock in Network.AuthedConnections)
                        {
                            if (asock.Account.AccountId.Equals(a.AccountId))
                            {                                
                                if (!asock.Socket.IsAvailable) {
                                    duplicated = asock;
                                    Network.AuthedConnections.Remove(duplicated);
                                }
                                socket.Send("server.socket.error");
                                return;
                                /*asock.Socket.Close();
                                duplicated = asock;*/
                            }
                        }
                        GameSocket duplicatedG = null;
                        foreach (GameSocket gs in Network.GamingConnections) {
                            if (gs.Account.AccountId.Equals(a.AccountId)) {
                                if (!gs.Socket.IsAvailable)
                                {
                                    duplicatedG = gs;
                                    Network.GamingConnections.Remove(duplicatedG);
                                }
                                socket.Send("server.socket.error");
                                return;
                            }
                        }
                        Network.Connections.Remove(socket);                        
                        Network.AuthedConnections.Add(new AuthSocket(a, socket));
                        socket.Send("server.socket.ok");
                    }
                }
            }
            else if (msg.StartsWith("editor.class.list"))
            {
                using (Database DataContext = new Database(Program.Configuration["database:connection-string"]))
                {
                    List<Class> classes =  DataContext.Classes.ToList();
                    socket.Send("server.class.list|"+ JsonConvert.SerializeObject(classes));
                }
            }
            else if (msg.StartsWith("editor.class.create"))
            {
                using (Database DataContext = new Database(Program.Configuration["database:connection-string"]))
                {
                    string[] arguments = msg.Split("|");
                    Class c = new Class(arguments[1], Int32.Parse(arguments[2]), Int32.Parse(arguments[3]), arguments[4], "Code this part");
                    DataContext.Classes.Add(c);
                    DataContext.SaveChanges();
                    socket.Send("server.class.created");
                }
            }
            else if (msg.StartsWith("editor.class.update"))
            {
                using (Database DataContext = new Database(Program.Configuration["database:connection-string"]))
                {
                    string[] arguments = msg.Split("|");
                    Class c = new Class(arguments[2], Int32.Parse(arguments[3]), Int32.Parse(arguments[4]), arguments[5], "Update:Code this part");
                    c.ClassId = arguments[1];
                    Class oldClass=DataContext.Classes.Find(c.ClassId);
                    DataContext.Entry(oldClass).CurrentValues.SetValues(c);
                    DataContext.SaveChanges();
                    socket.Send("server.class.updated");
                }
            }
        }

        static public void OnOpen(IWebSocketConnection socket)
        {
            Log.Information("Connection openned from " + socket.ConnectionInfo.ClientIpAddress);
        }

        static public void OnClose(IWebSocketConnection socket)
        {
            Log.Information("Connection closed from " + socket.ConnectionInfo.ClientIpAddress);
        }

        static public void SendMessage(IWebSocketConnection socket, string msg)
        {
            Log.Information("Message " + msg + " sent to " + socket.ConnectionInfo.ClientIpAddress);
        }
    }
}
