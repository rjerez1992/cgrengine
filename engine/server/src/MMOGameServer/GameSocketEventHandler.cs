using MMOLibrary.Model;
using Newtonsoft.Json;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.EntityFrameworkCore;
using MMOLibrary;
using System.Threading;
using System.Diagnostics;

namespace MMOGameServer
{
    class GameSocketEventHandler
    {
        static public void OnMessage(GameSocket gameSocket, string msg)
        {
            //Log.Information("GameSocket > " + msg + " from host " + gameSocket.Socket.ConnectionInfo.ClientIpAddress);
            if (msg.StartsWith("client.char.move"))
            {
                string[] arguments = msg.Split("|");
                int dirValue = Convert.ToInt32(arguments[1]);
                AABB.Movdir dir = AABB.Movdir.TOP;
                switch (dirValue)
                {
                    case 0:
                        gameSocket.SelectedCharacter.movementDirection = MovingDirection.Top;
                        dir = AABB.Movdir.TOP;
                        break;
                    case 2:
                        gameSocket.SelectedCharacter.movementDirection = MovingDirection.Right;
                        dir = AABB.Movdir.RIGHT;
                        break;
                    case 4:
                        gameSocket.SelectedCharacter.movementDirection = MovingDirection.Down;
                        dir = AABB.Movdir.DOWN;
                        break;
                    case 6:
                        gameSocket.SelectedCharacter.movementDirection = MovingDirection.Left;
                        dir = AABB.Movdir.LEFT;
                        break;
                    default:
                        break;
                }
                gameSocket.SelectedCharacter.BoundingBox.SetMovement(dir);
            }
            else if (msg.StartsWith("client.char.stop"))
            {
                gameSocket.SelectedCharacter.movementDirection = MovingDirection.Stop;
                gameSocket.SelectedCharacter.BoundingBox.StopMovement();
            }
            else if (msg.StartsWith("client.chat.message"))
            {
                string[] arguments = msg.Split("|");
                string m = arguments[1];
                string message = gameSocket.SelectedCharacter.Name + ": " + m;
                foreach (GameSocket gs in Network.GamingConnections)
                {
                    gs.Socket.Send("server.chat.message|" + message);
                }
            }
            else if (msg.StartsWith("client.map.chonmap"))
            {
                SimulationMap sm = Program.SimulatedMaps.FirstOrDefault(smm => smm.Map.MapId == gameSocket.SelectedCharacter.CurrentMapId);
                if (sm != null) {
                    sm.GetOtherCharsOnMap(gameSocket.SelectedCharacter);
                }
            }
            else if (msg.StartsWith("client.cast.spell1"))
            {
                SimulationMap sm = Program.SimulatedMaps.FirstOrDefault(smm => smm.Map.MapId == gameSocket.SelectedCharacter.CurrentMapId);
                if (sm != null)
                {
                    gameSocket.SelectedCharacter.CurrentResource -= 5;
                    string[] arguments = msg.Split("|");
                    sm.AddProjectile(gameSocket.SelectedCharacter, Convert.ToInt32(arguments[1]), Convert.ToInt32(arguments[2]), 4, 10, 23, 10, false);
                }
            }
            else if (msg.StartsWith("client.cast.spell2"))
            {
                SimulationMap sm = Program.SimulatedMaps.FirstOrDefault(smm => smm.Map.MapId == gameSocket.SelectedCharacter.CurrentMapId);

                if (sm!=null && gameSocket.SelectedCharacter.CurrentResource > 20) {
                    gameSocket.SelectedCharacter.CurrentResource -= 20;
                    gameSocket.SelectedCharacter.isShielded = true;
                    sm.NotifyAllInMap("csh|" + gameSocket.SelectedCharacter.CharacterId);
                    new Thread(new ThreadStart(()=> {
                        Thread.Sleep(3000);
                        try
                        {
                            gameSocket.SelectedCharacter.isShielded = false;
                            sm.NotifyAllInMap("cnsh|" + gameSocket.SelectedCharacter.CharacterId);
                        }
                        catch (Exception e) {
                            Console.WriteLine("Couldn't find entity to stop spell2");
                        }
                    })).Start();                    
                }
            }
            else if (msg.StartsWith("client.cast.spell3"))
            {
                SimulationMap sm = Program.SimulatedMaps.FirstOrDefault(smm => smm.Map.MapId == gameSocket.SelectedCharacter.CurrentMapId);
                if (sm != null)
                {
                    gameSocket.SelectedCharacter.CurrentResource -= 50;
                    string[] arguments = msg.Split("|");
                    sm.AddProjectile(gameSocket.SelectedCharacter, Convert.ToInt32(arguments[1]), Convert.ToInt32(arguments[2]), 1, 20, 60, 5, true);
                }
            }
            else
            {
                Log.Error("Un-handled command from client " + msg);
            }
        }

        static public void OnClose(GameSocket gameSocket) {
            using (Database DataContext = new Database(Program.Configuration["database:connection-string"]))
            {
                Character c = DataContext.Characters.Find(gameSocket.SelectedCharacter.CharacterId);               
                //DataContext.Entry(oldMap).CurrentValues.SetValues(m);
                c.CoordX = gameSocket.SelectedCharacter.BoundingBox.X;
                c.CoordY = gameSocket.SelectedCharacter.BoundingBox.Y;
                DataContext.SaveChanges();
            }

            SimulationMap sm = Program.SimulatedMaps.FirstOrDefault(smm => smm.Map.MapId == gameSocket.SelectedCharacter.CurrentMapId);
            sm.RemoveCharacter(gameSocket.SelectedCharacter);

            Network.GamingConnections.Remove(gameSocket);
        }
    }
}
