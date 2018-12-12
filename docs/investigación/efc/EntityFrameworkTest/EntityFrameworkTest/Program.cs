using System;
using System.Collections.Generic;
using System.Linq;

namespace EntityFrameworkTest
{
    class Program
    {
        static void Main(string[] args)
        {
            using (var Database = new Database())
            {
                Database.Database.EnsureCreated();

                /*
                for (int i = 0; i < 10; i++)
                {
                    Person p = new Person("Juan"+i, i+i*2);
                    Database.Person.Add(p);
                    
                }
                Database.SaveChanges();
                
                Person p = new Person("Juan", 18);
                Database.Person.Add(p);
                Database.SaveChanges();*/
                /*
                var persons = Database.Person;
                foreach (Person p in persons) {
                    Console.WriteLine(p.Name);
                }*/

                var personasMayores10 = Database.Person.Where(x => x.Age > 10).ToList();
                foreach (Person p in personasMayores10) {
                    Console.WriteLine(p.Name);
                }
             
            }

            Console.WriteLine("Hello World!");
            Console.ReadKey();
        }
    }
}
