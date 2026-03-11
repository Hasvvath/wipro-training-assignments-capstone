using System;
using System.Collections.Generic;
using System.Text;



namespace UserManagementApp
{
    public class UserService
    {
        private readonly IUserRepository _repository;

        public UserService(IUserRepository repository)
        {
            _repository = repository;
        }

        public void Register(User user)
        {
            if (user.Age < 18)
                throw new ArgumentException("User must be 18 or older");

            if (_repository.EmailExists(user.Email))
                throw new InvalidOperationException("Email already exists");

            _repository.Add(user);
        }
    }
}
