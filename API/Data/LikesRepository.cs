using API.Data;
using API.DTOs;
using API.Entities;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API;

public class LikesRepository(DataContext context, IMapper mapper) : ILikesRepository
{
    public void AddLike(UserLike like)
    {
        context.Likes.Add(like);
    }

    public void DeleteLike(UserLike like)
    {
        context.Likes.Remove(like);
    }

    public async Task<IEnumerable<int>> GetCurrentUserLikesIds(int currentUserId)
    {
        return await context.Likes
            .Where(like => like.SourceUserId == currentUserId)
            .Select(like => like.TargetUserId)
            .ToListAsync();
    }

    public async Task<UserLike?> GetUserLike(int sourceUserId, int targetUserId)
    {
        return await context.Likes.FindAsync(sourceUserId, targetUserId);
    }

    public async Task<IEnumerable<MemberDto>> GetUserLikes(string predicate, int userId)
    {
        var users = context.Users.AsQueryable();
        var likes = context.Likes.AsQueryable();

        if (predicate == "liked")
        {
            return await likes
                .Where(x => x.SourceUserId == userId)
                .Select(x => x.TargetUser)
                .ProjectTo<MemberDto>(mapper.ConfigurationProvider)
                .ToListAsync();
        }

        if (predicate == "likedBy")
        {
            return await likes
                .Where(x => x.TargetUserId == userId)
                .Select(x => x.SourceUser)
                .ProjectTo<MemberDto>(mapper.ConfigurationProvider)
                .ToListAsync();
        }
        
        var likeIds = await GetCurrentUserLikesIds(userId);
        return await likes
            .Where(x => x.TargetUserId == userId && likeIds.Contains(x.SourceUserId))
            .Select(x => x.SourceUser)
            .ProjectTo<MemberDto>(mapper.ConfigurationProvider)
            .ToListAsync();
                


    }

    public async Task<bool> SaveChanges()
    {
        return await context.SaveChangesAsync() > 0;
    }
}