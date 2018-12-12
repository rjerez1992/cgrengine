using System;
using System.Collections.Generic;
using System.Text;

namespace MMOLibrary.Model
{
    public abstract class NetworkInstance
    {
        public abstract void Notify(string msg);
    }
}
