using API.Data;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
    {
        services.AddControllers();
        services.AddDbContext<DataContext>(options =>
        {
            var connectionString = config.GetConnectionString("DefaultConnection") ?? throw new Exception("DefaultConnection is missing from appsettings.json");
            options.UseSqlite(connectionString);
        });
        services.AddCors();
        services.AddScoped<ITokenService, TokenService>();

        return services;

    }
}