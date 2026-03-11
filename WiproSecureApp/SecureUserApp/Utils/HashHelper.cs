using System;
using System.Collections.Generic;
using System.Text;
using System.Security.Cryptography;

namespace SecureUserApp.Utils
{
    public static class HashHelper
    {
        public static string HashPassword(string password)
        {
            using SHA256 sha = SHA256.Create();
            byte[] bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
    }
}