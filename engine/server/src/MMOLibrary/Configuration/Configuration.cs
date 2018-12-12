using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace MMOLibrary
{
    class Configuration
    {
        static public IConfiguration Data = Build();

        static public IConfiguration Build()
        {     
            var builder = new ConfigurationBuilder()
           .SetBasePath(Directory.GetCurrentDirectory())
           .AddJsonFile("Configuration/Database.json");
            //NOTE: Include extra configuration files here
            return builder.Build();
        }
    }
}
