using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using System.Linq;

namespace MMOLibrary
{
    public class Map
    {
        public string MapId { set; get; }
        public string Name { set; get; }
        //NOTE: First layer is a block layer
        //Ones are to describe areas where players can't get into
        //0 = Walkeable 1=Non-walkeable 2=Wall
        public string _layers { set; get; }
        [NotMapped]
        public int[,,] Layers {
            set {
                this._layers = JsonConvert.SerializeObject(value);
            }
            get {
                return JsonConvert.DeserializeObject<int[,,]>(_layers);
            }
        }        
        public int LayerSize { set; get; }

        public Map() {}

        public Map(string name, int size) {
            this.Name = name;
            this.LayerSize = size;
            int[,,] tmp = new int[5, this.LayerSize, this.LayerSize];
            this._layers = JsonConvert.SerializeObject(tmp);
            this.Layers = tmp;
        }

        public void FillLayer(int layer, int value) {
            if (layer > 4) { return; } //NOTE: Total layers are 5
            int[,,] tmpLayer = this.Layers;
            for (int i = 0; i < this.LayerSize; i++)
            {
                for (int j = 0; j < this.LayerSize; j++)
                {
                    tmpLayer[layer, i, j] = value;
                }
            }
            this.Layers = tmpLayer;
        }

        public void RandomFillLayerInRange(int layer, int minValue, int maxValue, double threshold)
        {
            if (layer > 4) { return; } //NOTE: Total layers are 5
            Random r = new Random();
            int[,,] tmpLayer = this.Layers;
            for (int i = 0; i < this.LayerSize; i++)
            {
                for (int j = 0; j < this.LayerSize; j++)
                {
                    if (r.NextDouble() > threshold) {
                        tmpLayer[layer, i, j] = r.Next(minValue, maxValue+1);
                    }
                }
            }
            this.Layers = tmpLayer;
        }

        static public Map GenerateRandomMap() {
            //Random r = new Random();
            Map m = new Map("Seed", 32);
            m.RandomFillLayerInRange(0, 0, 0, 1);
            m.RandomFillLayerInRange(1, 1, 1, 0);
            m.RandomFillLayerInRange(2, 2, 2, 0.8);
            using (Database DataContext = new Database(Configuration.Data["database:connection-string"]))
            {
                DataContext.Maps.Add(m);
                DataContext.SaveChanges();
            }
            Console.WriteLine("Map id creado: "+m.MapId);
            return m;
        }

        static public Map GetMapWithId(string MapId) {
            using (Database DataContext = new Database(Configuration.Data["database:connection-string"]))
            {
                return DataContext.Maps.FirstOrDefault(map => map.MapId == MapId);
            }
        }
    }
}
