using System;
using System.Collections.Generic;
using System.Text;
using SecureUserApp.Services;
using Xunit;

namespace SecureUserApp.Tests
{
    public class UserTests
    {
        [Fact]
        public void Register_And_Login_Should_Work()
        {
            var service = new UserService();
            service.Register("admin", "123", "a@gmail.com");

            bool result = service.Login("admin", "123");

            Assert.True(result);
        }
    }
}