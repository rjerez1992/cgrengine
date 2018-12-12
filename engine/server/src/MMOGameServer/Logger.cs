using Serilog;
using Serilog.Events;
using System;
using System.Collections.Generic;
using System.Text;

namespace MMOGameServer
{
    class Logger
    {
        static public void Initialize()
        {
            Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
            .Enrich.FromLogContext()
            .WriteTo.Console()
            .WriteTo.File("GameServerLog.txt", rollingInterval: RollingInterval.Day)
            .CreateLogger();
        }
    }
}
