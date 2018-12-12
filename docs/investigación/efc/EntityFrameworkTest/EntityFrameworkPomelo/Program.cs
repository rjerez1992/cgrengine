using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace EntityFrameworkPomelo
{
    class Program
    {
        static void Main(string[] args)
        {
            using (var db = new Database())
            {
                db.Database.EnsureCreated();
                /*
                for (int i = 0; i < 10; i++)
                {                         
                    Person p = new Person("Patricio" + i, i * i / 2);
                    p.Hobbies.Add(new Hobby("Just Dance"));
                    p.Hobbies.Add(new Hobby("Programacion"));
                    db.Persons.Add(p);
                          
                }
                db.SaveChanges();*/
                
                db.Persons.Include(x => x.Hobbies).ToList();

                Person p = db.Persons.Where();
                Console.WriteLine(p.Name);
                foreach (Hobby h in p.Hobbies) {
                    Console.WriteLine(h.Value);
                }              
             
                Console.ReadKey();

                /*
                Person p = db.Persons.First(x => x.Age > 10);               
                p.Hobbies.Object.Add("Rum");
                db.Entry(p).State = EntityState.Modified;
                db.SaveChanges();
                Console.ReadKey();*/
                
                /*
                if (db.Persons.Any(e => e.Name == p.Name))
                {
                    db.Entry(p).State = EntityState.Modified;
                }
                else
                {
                    db.Entry(p).State = EntityState.Added;
                }
                db.SaveChanges();*/
               
            }
        }
    }
}
