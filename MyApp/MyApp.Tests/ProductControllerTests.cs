using System;
using System.Collections.Generic;
using System.Text;

using Xunit;
using Microsoft.AspNetCore.Mvc;
using MyApp.Controllers;

namespace MyApp.Tests
{
    public class ProductControllerTests
    {
        [Fact]
        public void Get_InvalidId_ReturnsBadRequest()
        {
            // Arrange
            var controller = new ProductController();

            // Act
            var result = controller.Get(0);

            // Assert
            Assert.IsType<BadRequestResult>(result);
        }
    }
}

