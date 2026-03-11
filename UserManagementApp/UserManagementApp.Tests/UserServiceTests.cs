using System;
using System.Collections.Generic;
using System.Text;

using Xunit;
using Moq;
using UserManagementApp;

public class UserServiceTests
{
    [Fact]
    public void Register_Should_Add_User_When_Valid()
    {
        var mockRepo = new Mock<IUserRepository>();

        mockRepo.Setup(r => r.EmailExists(It.IsAny<string>()))
                .Returns(false);

        var service = new UserService(mockRepo.Object);

        var user = new User
        {
            Email = "test@mail.com",
            Age = 25
        };

        service.Register(user);

        mockRepo.Verify(r => r.Add(It.IsAny<User>()), Times.Once);
    }
    [Fact]
    public void Register_Should_Throw_When_Underage()
    {
        var mockRepo = new Mock<IUserRepository>();
        var service = new UserService(mockRepo.Object);

        var user = new User
        {
            Email = "test@mail.com",
            Age = 15
        };

        Assert.Throws<ArgumentException>(() => service.Register(user));

        mockRepo.Verify(r => r.Add(It.IsAny<User>()), Times.Never);
    }
    [Fact]
    public void Register_Should_Throw_When_Email_Exists()
    {
        var mockRepo = new Mock<IUserRepository>();

        mockRepo.Setup(r => r.EmailExists(It.IsAny<string>()))
                .Returns(true);

        var service = new UserService(mockRepo.Object);

        var user = new User
        {
            Email = "duplicate@mail.com",
            Age = 25
        };

        Assert.Throws<InvalidOperationException>(() => service.Register(user));

        mockRepo.Verify(r => r.Add(It.IsAny<User>()), Times.Never);
    }
}