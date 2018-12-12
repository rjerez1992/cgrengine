using MMOLibrary.Model;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

namespace MMOLibrary
{
    public class Account
    {
        public string AccountId { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public string Salt { get; set; }
        public string Token { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime EditedAt { get; set; }
        public List<Character> Characters { get; set; }

        public Account() { }

        //Password must come encrypted
        public Account(string username, string password, string email, string salt) {
            this.Username = username;
            this.Password = password;
            this.Email = email;
            this.Salt = salt;
            this.CreatedAt = DateTime.Now;
            this.EditedAt = DateTime.Now;
            this.Characters = new List<Character>();
        }

        static public string EncryptPassword(string password, string salt)
        {
            byte[] encryptedBytes = { };
            using (var sha512 = new SHA512Managed())
            {
                encryptedBytes = sha512.ComputeHash(Encoding.UTF8.GetBytes(password + salt));
            }
            return Convert.ToBase64String(encryptedBytes);
        }

        static public string GenerateSalt()
        {
            var random = new RNGCryptoServiceProvider();
            byte[] salt = new byte[32];
            random.GetNonZeroBytes(salt);
            return Convert.ToBase64String(salt);
        }

        static public string GenerateToken(string username, string ipAddr) {
            byte[] encryptedBytes = { };
            using (var sha512 = new SHA512Managed())
            {
                encryptedBytes = sha512.ComputeHash(Encoding.UTF8.GetBytes(username + ipAddr));
            }
            return Convert.ToBase64String(encryptedBytes);
        }

        public static String Sha256Password(string value)
        {
            StringBuilder Sb = new StringBuilder();

            using (var hash = SHA256.Create())
            {
                Encoding enc = Encoding.UTF8;
                Byte[] result = hash.ComputeHash(enc.GetBytes(value));

                foreach (Byte b in result)
                    Sb.Append(b.ToString("x2"));
            }

            return Sb.ToString();
        }
    }
}
