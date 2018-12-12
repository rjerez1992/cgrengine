using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace EntityFrameworkPomelo
{
    class Database : DbContext
    {
        public DbSet<Person> Persons { get; set; }
        public DbSet<Hobby> Hobbys { get; set; }
        /*
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Person>()
                .HasMany(p => p.Hobbies).
                WithOne();
        }*/

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
           => optionsBuilder
               .UseMySql(@"Server=localhost;database=pomelo;uid=dev;pwd=dev;");
        
    }
}
