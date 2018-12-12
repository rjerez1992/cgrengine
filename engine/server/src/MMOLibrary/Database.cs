using Microsoft.EntityFrameworkCore;
using MMOLibrary.Model;
using System;
using System.Collections.Generic;
using System.Text;

namespace MMOLibrary
{
    public class Database : DbContext
    {
        private string _connectionString { get; set; }
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Map> Maps { get; set; }
        public DbSet<Zone> Zones { get; set; }
        public DbSet<Class> Classes { get; set; }
        public DbSet<Character> Characters { get; set; }

        public Database(string connectionString) {
            this._connectionString = connectionString;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(this._connectionString);
        }

        static public bool CheckConnection(string connectionString)
        {            
            using (Database DataContext = new Database(connectionString))
            {        
                return DataContext.Database.EnsureCreated();
            }           
        }
    }
}
