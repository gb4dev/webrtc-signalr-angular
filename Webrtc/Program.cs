using Webrtc;
using Webrtc.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddSignalR();
builder.Services.AddCors(o => o.AddPolicy("CorsPolicy", builder => builder
        .WithOrigins("http://localhost:4200")
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials()));
Guid roomId = Guid.Parse("ad81836f-e761-4e9b-97a4-3668e8b26459");
HubObjects.Rooms[roomId.ToString()] = new Room()
{
    Id = roomId,
};
var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}
app.UseStaticFiles();
app.UseRouting();
app.UseCors("CorsPolicy");

app.UseAuthorization();

app.MapRazorPages();
app.MapHub<AppHub>("/appHub");
app.Run();
