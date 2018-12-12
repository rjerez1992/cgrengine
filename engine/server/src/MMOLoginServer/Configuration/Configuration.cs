using Microsoft.Extensions.Configuration;
using Serilog;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace MMOLoginServer
{
    class Configuration
    {
        static public IConfiguration Build() {
            Log.Information("Loading server configuration");            
            var builder = new ConfigurationBuilder()
           .SetBasePath(Directory.GetCurrentDirectory())
           .AddJsonFile("Configuration/Enviroment.json");
            //NOTE: Include extra configuration files here
            return builder.Build();
        }
    }
}
