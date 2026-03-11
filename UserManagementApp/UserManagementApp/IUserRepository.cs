using System;
using System.Collections.Generic;
using System.Text;

namespace UserManagementApp
{
    public interface IUserRepository
    {
        bool EmailExists(string email);
        void Add(User user);
    }
}