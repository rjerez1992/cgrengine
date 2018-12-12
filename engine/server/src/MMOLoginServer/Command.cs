using System;
using System.Collections.Generic;
using System.Text;

namespace MMOLoginServer
{
    class Command
    {
        static public void CreateAccount(string command) {
            string[] items = command.Split(' ');
            if (items.Length != 4)
            {
                Console.WriteLine(DateTime.Now + " [Command] Invalid arguments for create_account. " +
                                    "Use as create_account <username> <password> <email>");
                return;
            }
            //Authentication.CreateAccount(items[1], items[2], items[3]);
        }

        static public void Help() {

        }

        internal static void DeleteAccount(string cmd)
        {
            throw new NotImplementedException();
        }

        internal static void BanAccount(string cmd)
        {
            throw new NotImplementedException();
        }

        internal static void ListAccounts(string cmd)
        {
            throw new NotImplementedException();
        }

        internal static void ModifyAccount(string cmd)
        {
            throw new NotImplementedException();
        }

        internal static void AccountInfo(string cmd)
        {
            throw new NotImplementedException();
        }
    }
}
