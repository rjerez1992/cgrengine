using Fleck;
using System;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using Serilog;
using Serilog.Events;
using MMOLibrary;

namespace MMOLoginServer
{
    class Program
    {
        public static IConfiguration Configuration { get; set; }
        public static Network Network { get; set; }

        static void Main(string[] args){
            Logger.Initialize();
            Log.Information(@"
              ___  ___  ____  ____     __   _  _  ____  _  _    ____  ____  ____  _  _  ____  ____ 
             / __)/ __)(  _ \(  __)   / _\ / )( \(_  _)/ )( \  / ___)(  __)(  _ \/ )( \(  __)(  _ \
            ( (__( (_ \ )   / ) _)   /    \) \/ (  )(  ) __ (  \___ \ ) _)  )   /\ \/ / ) _)  )   /
             \___)\___/(__\_)(____)  \_/\_/\____/ (__) \_)(_/  (____/(____)(__\_) \__/ (____)(__\_)
            ");
            Log.Information("Starting authentication server");        
            Configuration = MMOLoginServer.Configuration.Build();
            Network = new Network(Configuration);
            Log.Information("Checking connection with database");
            Database.CheckConnection(Configuration["database:connection-string"]);
            Log.Information("Authentication server started");
            StartServerRoutine();
        }

        static public void StartServerRoutine() {
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
                else if (cmd.StartsWith("CreateAccount", StringComparison.OrdinalIgnoreCase))
                {
                    Command.CreateAccount(cmd);
                }
                else if (cmd.StartsWith("ModifyAccount", StringComparison.OrdinalIgnoreCase))
                {
                    Command.ModifyAccount(cmd);
                }
                else if (cmd.StartsWith("DeleteAccount", StringComparison.OrdinalIgnoreCase))
                {
                    Command.DeleteAccount(cmd);
                }
                else if (cmd.StartsWith("AccountInfo", StringComparison.OrdinalIgnoreCase))
                {
                    Command.AccountInfo(cmd);
                }
                else if (cmd.StartsWith("BanAccount", StringComparison.OrdinalIgnoreCase))
                {
                    Command.BanAccount(cmd);
                }
                else if (cmd.StartsWith("ListAccounts", StringComparison.OrdinalIgnoreCase))
                {
                    Command.ListAccounts(cmd);
                }
                else if (cmd.StartsWith("Help", StringComparison.OrdinalIgnoreCase)) {
                    Command.Help();
                }
                else
                {
                    Log.Error("Unrecognized command " + cmd);
                    Log.Information("Use \"help\" command to see available commands.");
                }
            }

        }

        static public void StopServerPreparation() {
            Log.Information("Stopping authentication server");
            //TODO:Save every volatile content
        }
    }
}
