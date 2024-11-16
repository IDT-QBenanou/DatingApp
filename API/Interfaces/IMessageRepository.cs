using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IMessageRepository
{
    // void AddGroup(Group group);
    void AddMessage(Message message);
    void DeleteMessage(Message message);
    // Task<Group> GetGroupForConnection(string connectionId);
    Task<Message> GetMessage(int id);
    // Task<Group> GetMessageGroup(string groupName);

    Task<PagedList<MessageDto>> GetMessagesForUser(MessageParams messageParams);
    Task<IEnumerable<MessageDto>> GetMessageThread(string currentUsername, string recipientUsername);
    Task<bool> SaveAllChanges();

    void AddGroup(Group group);

    void RemoveConnection(Connection connection);

    Task<Connection> GetConnection(string connectionId);

    Task<Group> GetMessageGroup(string groupName);
}