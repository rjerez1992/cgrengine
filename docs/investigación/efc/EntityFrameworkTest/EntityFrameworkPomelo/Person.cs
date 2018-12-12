using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace EntityFrameworkPomelo
{
    class Person
    {
        public string PersonId { get; set; }
        public string Name { set; get; }
        public int Age { set; get; }        
        public ICollection<Hobby> Hobbies { get; set; }

        public Person() {
            Hobbies = new List<Hobby>();
        }

        public Person(string name, int age)
        {
            this.Name = name;
            this.Age = age;
            this.Hobbies = new List<Hobby>();
        }             
    }
}
