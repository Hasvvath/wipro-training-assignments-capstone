using SecureUserApp.Models;
using SecureUserApp.Utils;
using Serilog;
using System.Text.Json;

namespace SecureUserApp.Services
{
    public class UserService
    {
        private string filePath = "users.json";
        private List<User> users;

        public UserService()
        {
            LoadUsers();
        }

        private void LoadUsers()
        {
            try
            {
                if (File.Exists(filePath))
                {
                    string json = File.ReadAllText(filePath);
                    users = JsonSerializer.Deserialize<List<User>>(json);
                }
                else
                {
                    users = new List<User>();
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error loading users");
                users = new List<User>();
            }
        }

        private void SaveUsers()
        {
            try
            {
                string json = JsonSerializer.Serialize(users);
                File.WriteAllText(filePath, json);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error saving users");
            }
        }

        public void Register(string username, string password, string email)
        {
            try
            {
                var hashed = HashHelper.HashPassword(password);
                var encryptedEmail = EncryptionHelper.Encrypt(email);

                users.Add(new User
                {
                    Username = username,
                    HashedPassword = hashed,
                    EncryptedEmail = encryptedEmail
                });

                SaveUsers();
                Log.Information("User registered: {Username}", username);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Registration failed");
            }
        }

        public bool Login(string username, string password)
        {
            try
            {
                var user = users.FirstOrDefault(u => u.Username == username);
                if (user == null) return false;

                var hashed = HashHelper.HashPassword(password);
                return user.HashedPassword == hashed;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Login error");
                return false;
            }
        }
    }
}