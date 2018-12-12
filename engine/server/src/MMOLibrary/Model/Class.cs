using System;
using System.Collections.Generic;
using System.Text;

namespace MMOLibrary.Model
{
    public class Class
    {
        public string ClassId { get; set; }
        public string Name { get; set; }
        public int Health { get; set; }
        public int Resource { get; set; }
        public string SpriteName { get; set; }
        public string Description { get; set; }

        public Class() { }

        public Class(string name, int health, int resource,  string spriteName, string description)
        {            
            Name = name;
            Health = health;
            SpriteName = spriteName;
            Description = description;
            Resource = resource;
        }
    }
}
