using API.Data;
using API.DTOs;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API;

public class MessageRepository(DataContext context, IMapper mapper) : IMessageRepository
{
    public void AddMessage(Message message)
    {
        context.Messages.Add(message);
    }

    public void DeleteMessage(Message message)
    {
        context.Messages.Remove(message);
    }

    public async Task<Message?> GetMessage(int id)
    {
        return await context.Messages.FindAsync(id);
    }

    public async Task<PagedList<MessageDto>> GetMessagesForUser(MessageParams messageParams)
    {
        var query = context.Messages
        .OrderByDescending(m => m.DateSent)
        .AsQueryable();

        DateTime dateNull = DateTime.Parse("0001-01-01T00:00:00");
        // query = query.Where(u => u.Recipient.UserName == messageParams.Username);

        query = messageParams.Container switch
        {
            "Inbox" => query.Where(u => u.Recipient.UserName == messageParams.Username),
            "Outbox" => query.Where(u => u.Sender.UserName == messageParams.Username),
            _ => query.Where(u => u.Recipient.UserName == messageParams.Username && u.DateRead == dateNull)
        };

        var messages = query.ProjectTo<MessageDto>(mapper.ConfigurationProvider);

        return await PagedList<MessageDto>.CreateAsync(messages, messageParams.PageNumber, messageParams.PageSize);
    }

    public async Task<IEnumerable<MessageDto>> GetMessageThread(string currentUsername, string recipientUsername)
    {
        var message = await context.Messages
            .Include(s => s.Sender).ThenInclude(p => p.Photos)
            .Include(r => r.Recipient).ThenInclude(p => p.Photos)
            .Where(m => m.Recipient.UserName == currentUsername && m.Sender.UserName == recipientUsername
                || m.Recipient.UserName == recipientUsername && m.Sender.UserName == currentUsername)
            .OrderBy(m => m.DateSent)
            .ProjectTo<MessageDto>(mapper.ConfigurationProvider)
            .ToListAsync();

        DateTime dateNull = DateTime.Parse("0001-01-01T00:00:00");
        var unreadMessages = message.Where(m => m.DateRead == dateNull && m.RecipientUsername == currentUsername).ToList();

        if(unreadMessages.Count > 0)
        {
            foreach(var unreadMessage in unreadMessages)
            {
                unreadMessage.DateRead = DateTime.UtcNow;
                await context.SaveChangesAsync();
            }

        }

        return mapper.Map<IEnumerable<MessageDto>>(message);
    }

    public async Task<bool> SaveAllChanges()
    {
        return await context.SaveChangesAsync() > 0;
    }
}