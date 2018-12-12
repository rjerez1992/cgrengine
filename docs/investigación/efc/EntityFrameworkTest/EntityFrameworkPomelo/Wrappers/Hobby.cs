using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace EntityFrameworkPomelo
{
    public class Hobby
    {   
        public int HobbyId { get; set; }
        public string Value { get; set; }

        public Hobby() { }

        public Hobby(string value) {
            this.Value = value;
        }
    }
}
