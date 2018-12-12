using System;
using System.Collections.Generic;
using System.Text;

namespace MMOLibrary.Model
{
    public class ServerProperties
    {
        public bool EditingModeEnabled { get; set; }
        public bool EngineSeeded { get; set; }
        public string GameName { get; set; }

        public Map RespawnMap { get; set; }
        public int RespawnX { get; set; }
        public int RespawnY { get; set; }

        public ServerProperties(Map m) {
            EditingModeEnabled = false;
            EngineSeeded = false;
            GameName = "Default Name";
            RespawnMap = m;
            RespawnX = 3;
            RespawnY = 3;
        }

    }
}
