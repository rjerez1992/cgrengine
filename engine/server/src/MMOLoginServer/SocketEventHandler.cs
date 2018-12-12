using Fleck;
using MMOLibrary;
using Newtonsoft.Json;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MMOLoginServer
{
    class SocketEventHandler
    {
        static public void OnMessage(IWebSocketConnection socket, string msg) {
            Log.Information("Message " + msg + " from host " + socket.ConnectionInfo.ClientIpAddress);
            if (msg.StartsWith("client.login"))
            {
                string[] arguments = msg.Split("|");

                using (Database DataContext = new Database(Program.Configuration["database:connection-string"]))
                {
                    Account acc = DataContext.Accounts.SingleOrDefault(a => a.Username== arguments[1]);
                    if (acc == null) {
                        socket.Send("server.login.notok");
                        return;
                    }
                    string givenPassword = Account.EncryptPassword(arguments[2], acc.Salt);
                    if (acc.Password.Equals(givenPassword))
                    {
                        string connectionToken = Account.GenerateToken(acc.Username, socket.ConnectionInfo.ClientIpAddress);
                        acc.Token = connectionToken;
                        DataContext.SaveChanges();
                        socket.Send("server.login.ok|"+connectionToken);
                    }
                    else {
                        socket.Send("server.login.notok");
                    }
                }
            }

            else if (msg.StartsWith("client.create.account")) {
                //username, password, email.
                string[] arguments = msg.Split("|");
                string salt = Account.GenerateSalt();
                string encryptedPassword = Account.EncryptPassword(arguments[2], salt);

                using (Database DataContext = new Database(Program.Configuration["database:connection-string"]))
                {
                    //Check username
                    Account test = DataContext.Accounts.SingleOrDefault(a => a.Username == arguments[1]);
                    if (test != null) {
                        socket.Send("server.create.account.failed");
                        return;
                    }
                    //Check email
                    test = DataContext.Accounts.SingleOrDefault(a => a.Email == arguments[3]);
                    if (test != null)
                    {
                        socket.Send("server.create.account.failed");
                        return;
                    }
                    //Create
                    Account acc = new Account(arguments[1], encryptedPassword, arguments[3], salt);
                    DataContext.Accounts.Add(acc);
                    DataContext.SaveChanges();              
                }
                socket.Send("server.account.created");
            }
        }

        static public void OnOpen(IWebSocketConnection socket) {
            Log.Information("Connection openned from " + socket.ConnectionInfo.ClientIpAddress);
        }

        static public void OnClose(IWebSocketConnection socket) {
            Log.Information("Connection closed from " + socket.ConnectionInfo.ClientIpAddress);
        }

        static public void SendMessage(IWebSocketConnection socket, string msg) {
            Log.Information("Message " + msg + " sent to " + socket.ConnectionInfo.ClientIpAddress);
        }


    }
}
