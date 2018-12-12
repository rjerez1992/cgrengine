using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace MMOLibrary.Model
{
    public class Projectile
    {
        public int ProjectileId;
        public AABB BoundingBox;
        public int Damage;
        public bool IsDestroyed;
        public int lifeSpanTicks;
        public string casterId;
        public bool PersistOnHit = false;
        [NotMapped]
        public object _lock = new object();

        public Projectile(int id, int x, int y, int size, int speed, int damage, int lst, string cId)
        {
            ProjectileId = id;
            BoundingBox = new AABB(x, y, size);
            BoundingBox.Size = size;
            BoundingBox.Speed = speed;
            Damage = damage;
            IsDestroyed = false;
            lifeSpanTicks = lst;
            casterId = cId;
        }

        public void UpdatePosition() {
            BoundingBox.UpdatePosition();
            if (BoundingBox.X < 0 || BoundingBox.Y < 0 || BoundingBox.X > 309 || BoundingBox.Y > 309) {
                this.IsDestroyed = true;
            }
        }
    }
}
