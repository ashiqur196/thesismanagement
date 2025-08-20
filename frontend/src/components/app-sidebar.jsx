import {
  BookMarked,
  Calendar,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Library,
  NotebookPen,
  Settings,
} from "lucide-react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { useAuth } from "../contexts/authContext";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenuButton,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
} from "./ui/sidebar";


function SidebarCustomItem({ item }) {
  return (
    <Link
      to={item.url}
    >
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

export function AppSidebar() {
  const { currentUser } = useAuth();
  const location = useLocation();

  // Common items for all users
  const commonItems = [
    {
      title: "Overview",
      url: "/",
      icon: LayoutDashboard,
      isActive: location.pathname==="/",
    },
    {
      title: "My Calendar",
      url: "/calendar",
      icon: Calendar,
      isActive: location.pathname.startsWith("/calendar"),
    },
  ];

  // Student-specific items
  const studentItems = [
    {
      title: "Browse Supervisors",
      url: "/supervisors",
      icon: GraduationCap,
      isActive: location.pathname.startsWith("/supervisors"),
    },

    {
      title: "My Thesis",
      url: "/mythesis",
      icon: FileText,
      isActive: location.pathname.startsWith("/mythesis"),
    },
    {
      title: "Create Thesis",
      url: "/createthesis",
      icon: NotebookPen,
      isActive: location.pathname.startsWith("/createthesis"),
    },
  ];

  // Faculty-specific items
  const facultyItems = [];

  // Account management items (common for all roles)
  const accountItems = [
    {
      title: "Account Settings",
      url: "/account",
      icon: Settings,
      isActive: location.pathname.startsWith("/account"),
      items: [
        {
          title: "My Profile",
          url: "/account/profile",
        },
        {
          title: "Edit Profile",
          url: "/account/edit",
        },
        {
          title: "Contributions",
          url: "/account/contributions",
        },
      ],
    },
  ];

  // Admin-specific items (placeholder for future implementation)
  const adminItems = [
    /* Will be added later */
  ];

  const getRoleItems = () => {
    if (!currentUser) return [];
    switch (currentUser.role) {
      case "STUDENT":
        return [...commonItems, ...studentItems];
      case "FACULTY":
        return [...commonItems, ...facultyItems];
      case "ADMIN":
        return [...commonItems, ...adminItems];
      default:
        return commonItems;
    }
  };

  const getNavMainItems = () => {
    if (!currentUser) return accountItems;
    if (currentUser.role === "FACULTY") {
      return [
        {
          title: "Thesis Management",
          url: "/supervising",
          icon: BookMarked,
          isActive: location.pathname.startsWith("/supervising"),
          items: [
            {
              title: "Current Thesis",
              url: "/supervising",
            },
            {
              title: "Requests",
              url: "/supervising/requests",
            },
            {
              title: "Completed",
              url: "/supervising/completed",
            },
          ],
        },
        ...accountItems,
      ];
    }
    return accountItems;
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
                  <span className="truncate font-medium">{"thesis manager"}</span>
                  <span className="truncate text-xs">{"manage your thesis"}</span>
                </div>
                
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
            {getRoleItems().map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarCustomItem item={item} />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        {/* Account Management and Faculty-specific sections */}
        <NavMain items={getNavMainItems()} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
