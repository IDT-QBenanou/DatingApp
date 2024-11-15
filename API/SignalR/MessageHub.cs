using Microsoft.AspNetCore.SignalR;
using API.Interfaces;
using API.Extensions;
using AutoMapper;
using API.DTOs;

namespace API;

public class MessageHub(IMessageRepository messageRepository, IUserRepository userRepository, IMapper mapper) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var otherUser = httpContext?.Request.Query["user"].ToString();

        if(Context.User == null || string.IsNullOrEmpty(otherUser)) throw new HubException("Invalid user");

        var groupName = GetGroupName(Context.User.Identity.Name, otherUser);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        var messages = await messageRepository.GetMessageThread(Context.User.Identity.Name, otherUser!);

        await Clients.Group(groupName).SendAsync("ReceiveMessageThread", messages);
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        return base.OnDisconnectedAsync(exception);
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

        messageRepository.AddMessage(message);

        if(await messageRepository.SaveAllChanges())
        {
            var group = GetGroupName(sender.UserName, recipient.UserName);
            await Clients.Group(group).SendAsync("NewMessage", mapper.Map<MessageDto>(message));
        }

        throw new HubException("Failed to send message");
    }

    private string GetGroupName(string caller, string other)
    {
        var stringCompare = string.CompareOrdinal(caller, other) < 0;
        return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}";
    }
}