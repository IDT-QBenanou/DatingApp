using API.Helpers;
namespace API;

public class MessageParams : PaginationParams
{
    public string? Username { get; set; }
    public string? Container { get; set; } = "Unread";
}

public class PaginationParams
{
    private const int MaxPageSize = 50;
    public int PageNumber { get; set; } = 1;
    private int _pageSize = 10;
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
    }
}