using Microsoft.AspNetCore.SignalR;

namespace Fracto.API.Hubs
{
    public class NotificationHub : Hub
    {
        public async Task RegisterUser(RegisterUserRequest request)
        {
            if (request == null) return;

            if (request.UserId > 0)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{request.UserId}");
            }

            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"role-{request.Role.ToLower()}");
            }
        }
    }

    public class RegisterUserRequest
    {
        public int UserId { get; set; }
        public string Role { get; set; } = "patient";
    }
}
