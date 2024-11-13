using API.DTOs;
using API.Entities;

namespace API;

public interface ILikesRepository
{
    Task<UserLike?> GetUserLike(int sourceUserId, int targetUserId);
    Task<IEnumerable<MemberDto>> GetUserLikes(string predicate, int userId);

    Task<IEnumerable<int>> GetCurrentUserLikesIds(int currentUserId);

    void AddLike(UserLike like);

    void DeleteLike(UserLike like);

    Task<bool> SaveChanges();
}