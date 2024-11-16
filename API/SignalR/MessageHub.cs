using Microsoft.AspNetCore.SignalR;
using API.Interfaces;
using API.Extensions;
using AutoMapper;
using API.DTOs;
using API.Entities;

namespace API;

public class MessageHub(IMessageRepository messageRepository, IUserRepository userRepository, IMapper mapper, IHubContext<PresenceHub> presenceHub) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var otherUser = httpContext?.Request.Query["user"].ToString();

        if(Context.User == null || string.IsNullOrEmpty(otherUser)) throw new HubException("Invalid user");

        var groupName = GetGroupName(Context.User.Identity.Name, otherUser);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        await AddToGroup(groupName);


        var messages = await messageRepository.GetMessageThread(Context.User.Identity.Name, otherUser!);

        await Clients.Group(groupName).SendAsync("ReceiveMessageThread", messages);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await RemoveFromMessageGroup();
        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(CreateMessageDto createMessageDto) {

        var username = Context.User?.GetUsername()?? throw new HubException("User not found");

        if(username == createMessageDto.RecipientUsername.ToLower())
        {
           throw new HubException("You cannot send messages to yourself");
        }

        var sender = await userRepository.GetUserByUsernameAsync(username);
        var recipient = await userRepository.GetUserByUsernameAsync(createMessageDto.RecipientUsername);

        if(recipient == null || sender == null)
        {
            throw new HubException("User not found");
        }

        var message = new Message
        {
            Sender = sender,
            Recipient = recipient,
            SenderUsername = sender.UserName,
            RecipientUsername = recipient.UserName,
            Content = createMessageDto.Content
        };

        var groupName = GetGroupName(sender.UserName, recipient.UserName);
        var group = await messageRepository.GetMessageGroup(groupName);

        if(group != null && group.Connections.Any(x => x.Username == recipient.UserName))
        {
            message.DateRead = DateTime.UtcNow;
        }
        else
        {
            var presenceTracker = new PresenceTracker();
            var connections = await presenceTracker.GetConnectionsForUser(recipient.UserName);
            if(connections != null && connections?.Count != null)
            {
                await presenceHub.Clients.Clients(connections)
                .SendAsync("NewMessageReceived", new {username = sender.UserName, knownAs = sender.KnownAs});
            }
        }

        messageRepository.AddMessage(message);

        if(await messageRepository.SaveAllChanges())
        {
            // var group = GetGroupName(sender.UserName, recipient.UserName);
            await Clients.Group(groupName).SendAsync("NewMessage", mapper.Map<MessageDto>(message));
        }

    }

    private async Task<bool> AddToGroup(string groupName)
    {
        var username = Context.User?.GetUsername() ?? throw new HubException("User not found");
        var group = await messageRepository.GetMessageGroup(groupName);
        var connection = new Connection{ ConnectionId = Context.ConnectionId, Username = username };

        if(group == null)
        {
            group = new Group{ Name = groupName };
            messageRepository.AddGroup(group);
        }

        group.Connections.Add(connection);

        return await messageRepository.SaveAllChanges();
    }

    private async Task<bool> RemoveFromMessageGroup()
    {
        var connection = await messageRepository.GetConnection(Context.ConnectionId);
        messageRepository.RemoveConnection(connection);

        return await messageRepository.SaveAllChanges();
    }

    private string GetGroupName(string caller, string other)
    {
        var stringCompare = string.CompareOrdinal(caller, other) < 0;
        return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}";
    }
}