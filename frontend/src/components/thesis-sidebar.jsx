import {
  Calendar,
  LayoutDashboard,
  Library,
  Settings,
  NotebookPen,
  FolderOpen,
  HomeIcon,
} from "lucide-react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { useAuth } from "../contexts/authContext";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenuButton,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
} from "./ui/sidebar";

function SidebarCustomItem({ item }) {
  return (
    <Link to={item.url}>
      <SidebarMenuButton
        tooltip={item.title}
        active={item.isActive}
        className={item.isActive ? "bg-accent text-accent-foreground" : ""}
      >
        <item.icon className="h-4 w-4" />
        <span>{item.title}</span>
      </SidebarMenuButton>
    </Link>
  );
}

export function ThesisSidebar() {
  //   const { currentUser } = useAuth();
  const location = useLocation();
  const { thesisId } = useParams();
  const { currentUser } = useAuth();

  // Base URL for thesis routes
  const baseUrl = `/thesis/${thesisId}`;

  // Common items for all users in thesis context
  const commonItems = [
    {
      title: "Overview",
      url: baseUrl,
      icon: LayoutDashboard,
      isActive: location.pathname === baseUrl,
    },
    {
      title: "Tasks",
      url: `${baseUrl}/tasks`,
      icon: NotebookPen,
      isActive: location.pathname.startsWith(`${baseUrl}/tasks`),
    },
    {
      title: "Appointments",
      url: `${baseUrl}/appointments`,
      icon: Calendar,
      isActive: location.pathname.startsWith(`${baseUrl}/appointments`),
    },
    {
      title: "Resources",
      url: `${baseUrl}/resources`,
      icon: FolderOpen,
      isActive: location.pathname.startsWith(`${baseUrl}/resources`),
    },
    {
      title: "Back to home",
      url: "/",
      icon: HomeIcon,
      isActive: location.pathname === "/",
    },
  ];

  // Settings items with nested structure
  const settingsItems = {
    title: "Settings",
    url: `${baseUrl}/settings`,
    icon: Settings,
    isActive: location.pathname.startsWith(`${baseUrl}/settings`),
    items: [
      {
        title: "Edit Thesis",
        url: `${baseUrl}/settings/edit`,
        isActive: location.pathname === `${baseUrl}/settings/edit`,
      },
      {
        title: "Collaborators",
        url: `${baseUrl}/settings/collaborators`,
        isActive: location.pathname === `${baseUrl}/settings/collaborators`,
      },
      {
        title: "Delete Thesis",
        url: `${baseUrl}/settings/delete`,
        isActive: location.pathname === `${baseUrl}/settings/delete`,
      },
      // Conditionally add Supervisor Requests for students
      ...(currentUser.role === "STUDENT"
        ? [
            {
              title: "Supervisor Requests",
              url: `${baseUrl}/settings/requests`,
              isActive: location.pathname === `${baseUrl}/settings/requests`,
            },
          ]
        : []),
    ],
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex w-full min-w-0 flex-col px-2 gap-1 mt-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Library className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Thesis Manager</span>
                  <span className="truncate text-xs">Manage your thesis</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
            {commonItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarCustomItem item={item} />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        {/* Settings section */}
        <NavMain items={[settingsItems]} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
