using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;

namespace MMOLibrary
{
    public class Zone
    {
        public string ZoneId { get; set; }
        public string Name { get; set; }
        public string _maps { get; set; }
        public int Size { get; set; }
        [NotMapped]
        public Map[,] Maps {
            set
            {
                this._maps = "";
               
                for (int i = 0; i < this.Size; i++)
                {
                    for (int j = 0; j < this.Size; j++)
                    {
                        Map m = value[i,j];
                        if (m != null)
                        {
                            this._maps += m.MapId+",";
                        }
                        else {
                            this._maps += "null,";
                        }
                    }                    
                }
                this._maps = this._maps.Remove(this._maps.Length - 1);                
            }

            get
            {               
                Map[,] map = new Map[Size,Size];
                string[] keys = this._maps.Split(",");
                for (int i = 0; i < this.Size; i++)
                {
                    for (int j = 0; j < this.Size; j++)
                    {
                        map[i, j] = Map.GetMapWithId(keys[0]);
                        keys = keys.Skip(1).ToArray();
                    }
                }
                return map;
            }
        }

        public Zone() {}

        public Zone(string name, int size) {
            this.Name = name;
            this.Size = size;
            this.Maps = new Map[this.Size, this.Size];
        }

        static public Zone GenerateRandomZone(string zoneName) {
            Zone zone = new Zone(zoneName, 1);
            zone.SetMapAt(Map.GenerateRandomMap(), 0, 0);
            using (Database DataContext = new Database(Configuration.Data["database:connection-string"]))
            {
                DataContext.Zones.Add(zone);
                DataContext.SaveChanges();
            }
            return zone;
        }

        public void SetMapAt(Map m, int index, int index2) {           
            Map[,] zoneMaps = this.Maps;
            zoneMaps.SetValue(m, index, index2);
            this.Maps = zoneMaps;
        }



    }
}
