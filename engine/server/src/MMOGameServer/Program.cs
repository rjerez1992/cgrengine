using Fleck;
using System;
using System.Collections.Generic;
using MMOLibrary;
using Microsoft.Extensions.Configuration;
using Serilog;
using Serilog.Events;
using Newtonsoft.Json;
using System.Linq;
using System.Threading;
using MMOLibrary.Model;
using System.Diagnostics;

namespace MMOGameServer
{
    class Program
    {
        public static IConfiguration Configuration { get; set; }
        public static Network Network { get; set; }
        public static bool EditionMode = false;
        public static List<SimulationMap> SimulatedMaps;

        private static List<Character> FakeLoadCharacters;

        static void Main(string[] args)
        {
            TestingPreparation(); //For testing purposes only

            System.Threading.Thread.Sleep(3000);
            Logger.Initialize();
            Log.Information(@"
              ___  ___  ____  ____     ___   __   _  _  ____    ____  ____  ____  _  _  ____  ____ 
             / __)/ __)(  _ \(  __)   / __) / _\ ( \/ )(  __)  / ___)(  __)(  _ \/ )( \(  __)(  _ \
            ( (__( (_ \ )   / ) _)   ( (_ \/    \/ \/ \ ) _)   \___ \ ) _)  )   /\ \/ / ) _)  )   /
             \___)\___/(__\_)(____)   \___/\_/\_/\_)(_/(____)  (____/(____)(__\_) \__/ (____)(__\_)
            ");
            Log.Information("Starting game server");
            Configuration = MMOGameServer.Configuration.Build();
            Network = new Network(Configuration);
            Log.Information("Checking connection with database");
            Database.CheckConnection(Configuration["database:connection-string"]);
            Log.Information("Starting map simulations");
            SetupMapsSimulations();
            Log.Information("Game server started");
            //ConstructDatabase();
            StartServerRoutine(); //This should run on the main thread. while the other stuff runs ins the other
        }

        private static void TestingPreparation()
        {
            FakeLoadCharacters = new List<Character>();
            Class css = new Class("Test", 1, 1, "0", "-");
            Random r = new Random();
            for (int i = 0; i < 10000; i++)
            {
                Character c = new Character("Test" + i, css);
                c.CharacterId = "t"+i;
                c.CoordX = 150;
                c.CoordY = 150;
                //c.BoundingBox.X = 140 + (5 * i);
                //c.BoundingBox.Y = 150;
                FakeLoadCharacters.Add(c);
            }
        }

        static public void StartServerRoutine()
        {
            Log.Information("Use \"help\" command to see available commands.");
            bool running = true;
            while (running)
            {
                string cmd = Console.ReadLine();
                if (cmd.Equals("Stop", StringComparison.OrdinalIgnoreCase))
                {
                    StopServerPreparation();
                    running = !running;
                }
                else if (cmd.StartsWith("Help", StringComparison.OrdinalIgnoreCase))
                {
                    Command.Help();
                }
                else if (cmd.StartsWith("GenerateRandomMap", StringComparison.OrdinalIgnoreCase))
                {
                    Program.GenerateRandomMap();
                }
                else if (cmd.StartsWith("GenerateRandomZone", StringComparison.OrdinalIgnoreCase))
                {
                    string[] values = cmd.Split(" ");
                    Program.GenerateRandomZone(values[1]);
                }
                else if (cmd.StartsWith("ListAllMaps", StringComparison.OrdinalIgnoreCase))
                {
                    Program.ListAllMaps();
                }
                else if (cmd.StartsWith("EditionMode", StringComparison.OrdinalIgnoreCase))
                {
                    Program.SwitchEditionMode();
                }
                else if (cmd.StartsWith("Seed"))
                {
                    using (Database DataContext = new Database(Configuration["database:connection-string"]))
                    {
                        Log.Information("Seeding the database");
                        //Creating first map and zone
                        Zone z = Zone.GenerateRandomZone("Seed"); //Adds it to the database.
                        //DataContext.Zones.Add(z);
                        //DataContext.SaveChanges();

                        //Creating classes
                        Class g = new Class("Warrior", 110, 100, "1", "Warriors are like wow very powerful but r melee fighters");
                        Class m = new Class("Mage", 70, 300, "0", "Mages are kinda weak however they deal some serious damage");
                        DataContext.Classes.Add(g);
                        DataContext.Classes.Add(m);
                        DataContext.SaveChanges();

                        //Creating first account
                        string salt = Account.GenerateSalt();
                        string encryptedPassword = Account.EncryptPassword(Account.Sha256Password("seed"), salt);
                        Account acc = new Account("seed", encryptedPassword, "seed@cgrengine.com", salt);
                        Character chr = new Character("Seed", DataContext.Classes.SingleOrDefault(cls => cls.Name == "Mage"));
                        acc.Characters.Add(chr);
                        DataContext.Accounts.Add(acc);
                        DataContext.SaveChanges();

                        Log.Information("Seeding completed.");
                    }
                }
                else if (cmd.StartsWith("test")) {
                    FakeCharactersBackgroundMovement();
                    foreach (Character c in FakeLoadCharacters) {
                        SimulatedMaps[0].AddCharacterToSimulation(c);
                        //Thread.Sleep(250);
                    }
                }
                else
                {
                    Log.Error("Unrecognized command " + cmd);
                    Log.Information("Use \"help\" command to see available commands.");
                }
            }

        }

        private static void FakeCharactersBackgroundMovement()
        {            
            Thread t = new Thread(new ThreadStart(UpdatePositions));
            t.Start();
        }

        public static void UpdatePositions() {
            Stopwatch sw = new Stopwatch();
            sw.Start();
            while (true) {
                if (sw.ElapsedMilliseconds > 100)
                {
                    for (int i = 0; i < FakeLoadCharacters.Count; i++)
                    {
                        FakeLoadCharacters[i].SetRandomDirection();
                    }
                    sw.Restart();
                }
                else {
                    Thread.Sleep(100);
                }
            }
        }

        static public void StopServerPreparation()
        {
            Log.Information("Stopping authentication server");
            //TODO:Save every volatile content
        }

        static public void GenerateRandomMap()
        {   
            //Remove
        }

        static public void GenerateRandomZone(string zoneName) {
            Log.Information("Generating random zone");
            Zone zone = Zone.GenerateRandomZone(zoneName);
            Log.Information("Random zone " + zone.Name + " has been generated");
        }

        static public void ListAllMaps()
        {
            using (Database DataContext = new Database(Configuration["database:connection-string"]))
            {
                Log.Information("There are " + DataContext.Maps.Count() + " maps in the database");
                DataContext.Maps.ToList().ForEach(i => Log.Information("MapId: " + i.MapId + " MapName: " + i.Name));
            }
        }

        static public void SwitchEditionMode() {              
            Program.EditionMode = !EditionMode;
            if (Program.EditionMode)
            {
                Program.DisconnectAllClients();
                Log.Information("Server is now on edition mode");

            }
            else {
                Log.Information("Server edition mode has been disabled");
            }
        }

        static public void DisconnectAllClients() {
            Log.Information("All clients are being disconected");
            Network.Connections.ForEach(c => c.Close());
            Network.AuthedConnections.ForEach(c => c.Socket.Close());
            Network.GamingConnections.ForEach(c => c.Socket.Close());
        }

        static public void SetupMapsSimulations()
        {
            SimulatedMaps = new List<SimulationMap>();
            using (Database DataContext = new Database(Configuration["database:connection-string"]))
            {
                List<Map> maps = DataContext.Maps.ToList();
                foreach (Map m in maps)
                {
                    SimulationMap sm = new SimulationMap(m);
                    SimulatedMaps.Add(sm);
                }
                foreach (SimulationMap sm in SimulatedMaps) {                    
                    sm.Start();
                }
            }
        }
    }
}

