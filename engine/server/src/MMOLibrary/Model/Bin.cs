using System;
using System.Collections.Generic;
using System.Text;

namespace MMOLibrary.Model
{
    public class Bin
    {
        public HashSet<Character> Characters;
        public HashSet<Projectile> Projectiles;
        

        public Bin() {
            Characters = new HashSet<Character>();
            Projectiles = new HashSet<Projectile>();
        }

        public void DetectCollisions() {
            foreach(Projectile p in Projectiles) {
                lock (p._lock)
                {
                    if (p.IsDestroyed)
                    {
                        break;
                    }
                }
                foreach (Character c in Characters) {
                    //Console.WriteLine("Testing character " + c.CharacterId + " against projectile: " + p.casterId);
                    lock (c._lock) {
                        if (c.IsDead) break;
                    }
                    if (!c.IsDead && !c.CharacterId.Equals(p.casterId) && c.CollidedWith(p.BoundingBox)) {
                        lock (p._lock)
                        {
                            if (p.IsDestroyed) break;
                            if (!p.PersistOnHit) {
                                p.IsDestroyed = true;
                            }
                        }
                        c.ManageCollision(p);
                        break;                        
                    }
                }
            }
        }


        
    }
}
