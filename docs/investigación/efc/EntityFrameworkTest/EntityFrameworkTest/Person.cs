using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace EntityFrameworkTest
{
    class Person
    {
        [Key]
        public string Name { set; get; }
        public int Age { set; get; }
        public string Hobbies { set; get; }

        public Person() { }

        public Person(string name, int age)
        {
            Name = name;
            Age = age;
            Hobbies = "none";
        }

    }
}
