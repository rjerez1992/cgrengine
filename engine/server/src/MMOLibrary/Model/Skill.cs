using System;
using System.Collections.Generic;
using System.Text;

namespace MMOLibrary.Model
{
    class Skill
    {
        string SkillId { get; set; }
        int ResourceCost { get; set; }
        int CastTime { get; set; }
        int CoolDown { get; set; }

        public Skill() { }

        public Skill(int resourceCost, int castTime, int coolDown)
        {
            ResourceCost = resourceCost;
            CastTime = castTime;
            CoolDown = coolDown;
        }

        //Redefined
    }
}
