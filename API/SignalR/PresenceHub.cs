using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API;

[Authorize]
public class PresenceHub(PresenceTracker tracker) : Hub
{
    public override async Task OnConnectedAsync()
    {
        // var httpContext = Context.GetHttpContext();
        // var route = httpContext.Request.RouteValues;
        // var groupName = route["groupName"].ToString();
        // await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        if(Context.User == null) throw new HubException("Unauthorized user");

        await tracker.UserConnected(Context.User?.GetUsername(), Context.ConnectionId);
        await Clients.Others.SendAsync("UserIsOnline", Context.User?.GetUsername());

        var onlineUsers = await tracker.GetOnlineUsers();
        await Clients.All.SendAsync("GetOnlineUsers", onlineUsers);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {

        if(Context.User == null) throw new HubException("Unauthorized user");
        await tracker.UserDisconnected(Context.User?.GetUsername(), Context.ConnectionId);
        await Clients.Others.SendAsync("UserIsOffline", Context.User?.GetUsername());

        var onlineUsers = await tracker.GetOnlineUsers();
        await Clients.All.SendAsync("GetOnlineUsers", onlineUsers);

        await base.OnDisconnectedAsync(exception);
    }
}