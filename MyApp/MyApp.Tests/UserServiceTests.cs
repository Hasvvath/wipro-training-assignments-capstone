using System;
using System.Collections.Generic;
using System.Text;

using Xunit;
using Moq;
using MyApp;

namespace MyApp.Tests
{
    public class UserServiceTests
    {
        [Fact]
        public void HasUsers_ReturnsTrue_WhenCountGreaterThanZero()
        {
            var mockRepo = new Mock<IUserRepo>();
            mockRepo.Setup(r => r.GetUserCount()).Returns(5);

            var service = new UserService(mockRepo.Object);

            var result = service.HasUsers();

            Assert.True(result);
        }
    }
}