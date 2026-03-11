using System;
using System.Collections.Generic;
using System.Text;
namespace SecureUserApp.Models
{
    public class User
    {
        public string Username { get; set; }
        public string HashedPassword { get; set; }
        public string EncryptedEmail { get; set; }
    }
}
