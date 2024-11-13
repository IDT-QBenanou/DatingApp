namespace API;

public class UserParams {

    private const int MaxPageSize = 1000;
    public int PageNumber { get; set; } = 1;
    private int _pageSize = 20;
    public int PageSize {
        get => _pageSize;
        set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
    }

    public int MinAge { get; set; } = 18;

    public int MaxAge { get; set; } = 99;

    public string? Gender { get; set; }

    public string? CurrentUsername { get; set; }

}