using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(ToolingRoomManagement.StartupOwin))]

namespace ToolingRoomManagement
{
    public partial class StartupOwin
    {
        public void Configuration(IAppBuilder app)
        {
            //AuthStartup.ConfigureAuth(app);
        }
    }
}
