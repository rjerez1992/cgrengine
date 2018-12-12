using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace MMOLibrary.Model
{
    public class AABB
    {
        public int X;
        public int Y;
        public int Size;
        public int VelocityX;
        public int VelocityY;
        public int Speed;

        //[NotMapped]
        //private int wallth = 4;

        public enum Movdir
        {
            TOP, DOWN, LEFT, RIGHT
        }
 
        public AABB(int x, int y, int size)
        {
            this.X = x;
            this.Y= y;
            Size = size;
            VelocityX = 0;
            VelocityY = 0;
            Speed = 2;
        }

        public bool CollidesWith(AABB test) {
            //Console.WriteLine("Object 1 - "+X+":"+Y+":"+Size);
            //Console.WriteLine("Object 2 - " + test.X + ":" + test.Y + ":" + test.Size);
            return ((test.X >= X && test.X <= X + Size) || (test.X + test.Size >= X && test.X + test.Size <= X + Size))
                && ((test.Y >= Y && test.Y <= Y + Size) || (test.Y + test.Size >= Y && test.Y + test.Size <= Y + Size));
        }

        
        public void UpdatePosition(int[][] blockLayer) {
            X += VelocityX;
            Y += VelocityY;

            //Bounds
            if (X < 0) X = 0;
            else if (X + Size >= 320) X = 320 - Size - 1;
            if (Y < 0) Y = 0;
            else if (Y + Size >= 320) Y = 320 - Size - 1;
            
            //Gridwalking
            if (blockLayer[(Y+2)/10][(X+2) / 10] == 1 ||
                blockLayer[(Y + Size-2) / 10][(X + Size-2) / 10] == 1 ||
                blockLayer[(Y+2) / 10][(X+ Size-2) / 10] == 1 ||
                blockLayer[(Y+ Size-2) / 10][(X+2) / 10] == 1) {
                //Revert changes
                X -= VelocityX;
                Y -= VelocityY;
            }
        }

        public void UpdatePosition()
        {
            X += VelocityX;
            Y += VelocityY;

            //ForProjetiles
            if (X < 0) X = 0;
            else if (X + Size >= 320) X = 320 - Size - 1;
            if (Y < 0) Y = 0;
            else if (Y + Size >= 320) Y = 320 - Size - 1;
        }

        //Requires args
        public void SetMovement(Movdir dir) {
            if (dir == Movdir.TOP) { this.VelocityY = -Speed; }
            if (dir == Movdir.DOWN) { this.VelocityY = Speed; }
            if (dir == Movdir.LEFT) { this.VelocityX = -Speed; }
            if (dir == Movdir.RIGHT) { this.VelocityX = Speed; }
        }

        public void StopMovement() {
            this.VelocityX = 0;
            this.VelocityY = 0;
        }
    }
}
