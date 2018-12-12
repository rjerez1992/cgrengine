using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;
using System.Threading;

namespace MMOLibrary.Model
{
    public class SimulationMap
    {
        public Map Map;
        public List<Character> Characters;
        public List<Projectile> Projectiles;
        public Bin[][] Bins;
        public Thread thread;
        public Thread updatePos;
        public Thread updateProPos;

        private long _lastUpdate;
        private long _timeFromLastUpdate;

        private long _minTimeBetweenUpdates;

        public object _charLock = new object();
        public object _projectileLock = new object();

        private int[][] currentMapBlockLayer;


        private int projectileCount = 0;

        private List<Projectile> readyToDelete = new List<Projectile>();


        private StringBuilder cycleCharacterPositionsMessage = new StringBuilder();
        //private string cycleProjectilePositionsMessage = "";

        //CHANGE THIS WHEN CHAGING BINS VALUES
        private int binValue = 320 / 4;

        public SimulationMap(Map m) {
            Map = m;
            _minTimeBetweenUpdates = 30; //40 ok
            _lastUpdate = 0;
            Characters = new List<Character>();
            Projectiles = new List<Projectile>();
            SetupBins();

            currentMapBlockLayer = new int[32][];
            for (int i = 0; i < 32; i++)
            {
                currentMapBlockLayer[i] = new int[32];
            }

            for (int i = 0; i < 32; i++)
            {
                for (int j = 0; j < 32; j++)
                {
                    currentMapBlockLayer[i][j] = Map.Layers[0, i, j];
                }
            }
            
      

        }

        public void Start() {
            //Definition of new threads                     
            thread = new Thread(new ThreadStart(CycleUpdates));
            thread.Start();
        }

        public void SetupBins() {         
            Bins = new Bin[4][];
            for (int i = 0; i < 4; i++)
            {
                Bins[i] = new Bin[4];
            }

            for (int i = 0; i < 4; i++)
            {
                for (int j = 0; j < 4; j++)
                {
                    Bins[i][j] = new Bin();
                }
            }
        }

        private void CycleUpdates() {
            //Console.WriteLine("Simulation for " + Map.Name + " started on thread " + Thread.CurrentThread.ManagedThreadId);
            Stopwatch stopwatch = new Stopwatch();
            Stopwatch stopwatch2 = new Stopwatch();
           
    
            stopwatch.Start();
            int tickCount = 0;
            int tickInvertal = 34;
            while (true)
            {
                _timeFromLastUpdate = stopwatch.ElapsedMilliseconds - _lastUpdate;
                if (_timeFromLastUpdate > _minTimeBetweenUpdates)
                {
                    if (Characters.Count > 0)
                    {
                        stopwatch2.Restart();
                        Update();
                        tickCount++;
                        if (tickCount > tickInvertal)
                        {
                            tickCount = 0;
                            UpdateLoad();
                        }
                        //Doesn't update the map if it has no characters
                        stopwatch2.Stop();                        
                        Console.WriteLine(stopwatch2.ElapsedMilliseconds);
                    }
                    else
                    {
                        //Console.WriteLine("Map "+Map.Name+" no characters and won't be updated");
                    }
                    _lastUpdate = stopwatch.ElapsedMilliseconds;
                }
                else {
                    Thread.Sleep(10);
                }
            }
        }

        private void UpdateLoad()
        {
            RegenResource();
        }

        private void RegenResource()
        {
            for (int i = 0; i < Characters.Count; i++)
            {
                Characters[i].UpdateLoad();
            }
        }

        public void RemoveCharacter(Character selectedCharacter)
        {                
            lock (_charLock) {
                this.Characters.Remove(selectedCharacter);
            }
            this.NotifyAllInMap("server.character.left|" + selectedCharacter.CharacterId);
        }

        public void AddProjectile(Character selectedCharacter, int mx, int my, int speed, int size, int lifeSpan, int damage, bool persist)
        {
            Projectile p = new Projectile(projectileCount++, selectedCharacter.BoundingBox.X, selectedCharacter.BoundingBox.Y, size, 1, damage, lifeSpan, selectedCharacter.CharacterId);      
            p.BoundingBox.VelocityX = speed*mx;
            p.BoundingBox.VelocityY = speed*my;
            p.PersistOnHit = persist;
            this.Projectiles.Add(p);
            this.NotifyAllInMap("mnp|" + JsonConvert.SerializeObject(p));
        }

      

        public void Update() {
            UpdatePositions();
            CheckCollision();
  

        }

        public void UpdatePositions() {
            EmptyBins();
            this.cycleCharacterPositionsMessage.Clear();
            this.cycleCharacterPositionsMessage.Append("scp");
            UpdateCharacterPositions();
            PropagateCharacterPositions();
            UpdateProjectilesPositions();
            
            CleanUpProjectiles();

        }

        private void PropagateCharacterPositions()
        {
            NotifyAllInMap(this.cycleCharacterPositionsMessage.ToString());
        }

        private void UpdateCharacterPositions() {
            lock (_charLock)
            {
                for (int i = 0; i < Characters.Count; i++)
                {
                    Characters[i].UpdatePosition(currentMapBlockLayer);
                    //NotifyAllInMap("scp|" + Characters[i].CharacterId + "|" + Characters[i].BoundingBox.X + "|" + Characters[i].BoundingBox.Y);
                    this.cycleCharacterPositionsMessage.Append("|");
                    this.cycleCharacterPositionsMessage.Append(Characters[i].CharacterId);
                    this.cycleCharacterPositionsMessage.Append("|");
                    this.cycleCharacterPositionsMessage.Append(Characters[i].BoundingBox.X);
                    this.cycleCharacterPositionsMessage.Append("|");
                    this.cycleCharacterPositionsMessage.Append(Characters[i].BoundingBox.Y);
                    this.cycleCharacterPositionsMessage.Append("|");
                    this.cycleCharacterPositionsMessage.Append(Characters[i].movementDirection);
                    reallocatePlayer(Characters[i]);
                }
            }
        }

        private void UpdateProjectilesPositions() {
            lock (_projectileLock) {
                for (int i = 0; i < Projectiles.Count; i++)              
                {
                    Projectiles[i].UpdatePosition();
                    //p.BoundingBox.UpdatePosition(Map.LayerSize * 10, Map.LayerSize * 10);
                    Projectiles[i].lifeSpanTicks--;
                    if (Projectiles[i].lifeSpanTicks < 0 || Projectiles[i].IsDestroyed)
                    {
                        Projectiles[i].IsDestroyed = true;
                        this.NotifyAllInMap("spd|" + Projectiles[i].ProjectileId);
                        continue;
                    }

                    this.NotifyAllInMap("spp|" + Projectiles[i].ProjectileId + "|" + Projectiles[i].BoundingBox.X + "|" + Projectiles[i].BoundingBox.Y);
                    reallocateProjectile(Projectiles[i]);
                }
            }
        }

        private void CleanUpProjectiles() {
            this.Projectiles.RemoveAll(o => o.IsDestroyed);
        }
        
        private void EmptyBins()
        {
            for (int i = 0; i < 4; i++)
            {
                for (int j = 0; j < 4; j++)
                {
                    Bins[i][j].Characters.Clear();
                    Bins[i][j].Projectiles.Clear();
                }
            }
        }

        /***
         * SUPER TODO: UNIFITY THE BOUNDINGBOXES AND REALLOCATION 
         * **/

        private void reallocatePlayer(Character c) {
            //Is it better to add to every bin or is it better if we check first (?)
            Bins[c.BoundingBox.X / binValue][c.BoundingBox.Y / binValue].Characters.Add(c);
            Bins[(c.BoundingBox.X + c.BoundingBox.Size) / binValue][c.BoundingBox.Y / binValue].Characters.Add(c);
            Bins[c.BoundingBox.X / binValue][(c.BoundingBox.Y+ c.BoundingBox.Size) / binValue].Characters.Add(c);
            Bins[(c.BoundingBox.X + c.BoundingBox.Size) / binValue][(c.BoundingBox.Y+ c.BoundingBox.Size) / binValue].Characters.Add(c);            
        }

        private void reallocateProjectile(Projectile c) {
            Bins[c.BoundingBox.X / binValue][c.BoundingBox.Y / binValue].Projectiles.Add(c);
            Bins[(c.BoundingBox.X + c.BoundingBox.Size) / binValue][c.BoundingBox.Y / binValue].Projectiles.Add(c);
            Bins[c.BoundingBox.X / binValue][(c.BoundingBox.Y + c.BoundingBox.Size) / binValue].Projectiles.Add(c);
            Bins[(c.BoundingBox.X + c.BoundingBox.Size) / binValue][(c.BoundingBox.Y + c.BoundingBox.Size) / binValue].Projectiles.Add(c);
        }
        

        public void CheckCollision() {
      
            for (int i = 0; i < Bins.Length; i++)
            {
                for (int j = 0; j < Bins[0].Length; j++)
                {
                    Bins[i][j].DetectCollisions();
                }
            }
          
        }

        public void AddCharacterToSimulation(Character c) {
            Console.WriteLine("Character " + c.Name + " joined the map " + Map.Name);
            NotifyAllInMap("server.map.chjoin|" + JsonConvert.SerializeObject(c));
            c.BoundingBox.X = c.CoordX;
            c.BoundingBox.Y = c.CoordY;
            lock (_charLock) {
                this.Characters.Add(c);
            }
            this.reallocatePlayer(c);
        }

        public void GetOtherCharsOnMap(Character c) {
            for (int i = 0; i < Characters.Count; i++)
            {
                if (Characters[i].CharacterId != c.CharacterId) {
                    c.GameSocket.Notify("server.map.chonmap|" + JsonConvert.SerializeObject(Characters[i]));
                }
            }
        }

        public void NotifyAllInMap(string msg) {
            for (int i = 0; i < Characters.Count; i++)
            {
                if (Characters[i].GameSocket != null) {
                    Characters[i].GameSocket.Notify(msg);
                }
            }
        }

     }
}
