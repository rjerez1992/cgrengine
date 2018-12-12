using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace MMOLibrary.Model
{
    public enum Orientation { Top, Left, Down, Right };
    public enum MovingDirection { Top, Left, Down, Right, Stop };

    public class Character
    {
        public string CharacterId { get; set; }
        public string Name { get; set; }
        public Class Class { get; set; }
        public string CurrentMapId { get; set; }
        public int CurrentHealth { get; set; }
        public int CurrentResource { get; set; }
        public int CoordX { get; set; }
        public int CoordY { get; set; }
        public Orientation Orientation { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime EditedAt { get; set; }
        public int Size { get; set; }
        [NotMapped]
        public AABB BoundingBox { get; set; }
        [NotMapped]
        public bool IsDead { get; set; }
        [NotMapped]
        public MovingDirection movementDirection;
        [NotMapped]
        [JsonIgnore]
        public NetworkInstance GameSocket { get; set; }
        [NotMapped]
        [JsonIgnore]
        public object _lock = new object();
        [NotMapped]
        public bool isShielded = false;


        public Character() {
            IsDead = false;
            BoundingBox = new AABB(CoordX, CoordY, 10);
            this.movementDirection = MovingDirection.Stop;
        }

        public Character(string name, Class clss)
        {
            Name = name;
            Class = clss;
            CurrentHealth = clss.Health;
            CurrentResource = clss.Resource;
            Orientation = Orientation.Down;
            CreatedAt = DateTime.Now;
            EditedAt = DateTime.Now;
            Size = 10;
            CoordX = 150;
            CoordY = 150;
            IsDead = false;
            BoundingBox = new AABB(CoordX, CoordY, Size);
            this.movementDirection = MovingDirection.Stop;
        }

        public bool CollidedWith(AABB test) {
            //Console.WriteLine("Checking collision");
            return BoundingBox.CollidesWith(test);
        }

        public void Move(Orientation o) {
            this.Orientation = o;
            switch (this.Orientation)
            {
                case Orientation.Top:
                    this.BoundingBox.VelocityX = 0;
                    this.BoundingBox.VelocityY = -this.BoundingBox.Speed;
                    break;
                case Orientation.Left:
                    this.BoundingBox.VelocityX = -this.BoundingBox.Speed;
                    this.BoundingBox.VelocityY = 0;
                    break;
                case Orientation.Down:
                    this.BoundingBox.VelocityX = 0;
                    this.BoundingBox.VelocityY = this.BoundingBox.Speed;
                    break;
                case Orientation.Right:
                    this.BoundingBox.VelocityX = this.BoundingBox.Speed;
                    this.BoundingBox.VelocityY = 0;
                    break;
            }
        }

        public void Stop() {
            this.BoundingBox.VelocityX = 0;
            this.BoundingBox.VelocityY = 0;
        }

        public void ManageCollision(object o) {
            if (o is Projectile) {
                Projectile p = (o as Projectile);
                this.DoDamage(p.Damage);
            }            
        }

        public void DoDamage(int damage) {
            if (this.isShielded) {
                return;
            }
            this.CurrentHealth -= damage;
            if (this.GameSocket != null) {
                this.GameSocket.Notify("scv|" + this.CurrentHealth);
            }
            CheckIfAlive();
        }
      

        public void CheckIfAlive() {            
            if (this.CurrentHealth <= 0) {
                this.IsDead = true;
                if (this.GameSocket != null) {
                    GameSocket.Notify("scd");
                }           
            }
        }

        internal void UpdatePosition(int[][] blockLayer)
        {
            BoundingBox.UpdatePosition(blockLayer);      
        }

        internal void UpdateLoad()
        {
            if (!this.IsDead && this.GameSocket != null)
            {
                this.CurrentHealth += 1;
                this.CurrentResource += 3;
                if (CurrentHealth > this.Class.Health) { CurrentHealth = this.Class.Health; }
                if (CurrentResource > this.Class.Resource) { CurrentResource = this.Class.Resource; }
                this.GameSocket.Notify("scr|" + this.CurrentResource);
                this.GameSocket.Notify("scv|" + this.CurrentHealth);
            }           
        }

        public void SetRandomDirection()
        {
            Random r = new Random();
            if (r.NextDouble() > 0.2) {
                return;
            }

            switch (r.Next(0, 5)) {
                case 0:
                    this.BoundingBox.VelocityX = 0;
                    this.BoundingBox.VelocityY = -1;
                    this.movementDirection = MovingDirection.Top;
                    break;
                case 1:
                    this.BoundingBox.VelocityX = 1;
                    this.BoundingBox.VelocityY = 0;
                    this.movementDirection = MovingDirection.Right;
                    break;
                case 2:
                    this.BoundingBox.VelocityX = 0;
                    this.BoundingBox.VelocityY = 1;
                    this.movementDirection = MovingDirection.Down;
                    break;
                case 3:
                    this.BoundingBox.VelocityX = -1;
                    this.BoundingBox.VelocityY = 0;
                    this.movementDirection = MovingDirection.Left;
                    break;
                case 4:
                    this.BoundingBox.VelocityX = 0;
                    this.BoundingBox.VelocityY = 0;
                    this.movementDirection = MovingDirection.Stop;
                    break;
            }
        }
    }
}
