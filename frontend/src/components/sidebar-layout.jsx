import { AppSidebar } from "./app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Separator } from "./ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { Fragment } from "react";

export default function SidebarLayout() {
  const { currentUser } = useAuth();
  const location = useLocation();

  return (
    <SidebarProvider>
      <AppSidebar 
        currentUser={currentUser}
        currentPath={location.pathname}
      />
      <SidebarInset>
        <header className="sticky bg-white top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {getBreadcrumbs(location.pathname, currentUser?.role).map((crumb, index, array) => (
                  <Fragment key={crumb.href}>
                    <BreadcrumbItem>
                      {index === array.length - 1 ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink>{crumb.label}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < array.length - 1 && (
                      <BreadcrumbSeparator />
                    )}
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Helper function to generate breadcrumbs
function getBreadcrumbs(pathname, role) {
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];
  
  // Add home breadcrumb
  breadcrumbs.push({
    href: "/",
    label: role === "STUDENT" ? "Student Portal" : role === "FACULTY" ? "Faculty Dashboard" : "Dashboard",
  });

  // Map path segments to breadcrumbs
  let currentPath = "";
  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    breadcrumbs.push({
      href: currentPath,
      label: formatBreadcrumbLabel(segment),
    });
  }

  return breadcrumbs;
}

// Format path segments into readable labels
function formatBreadcrumbLabel(segment) {
  const labelMap = {
    "": "Overview",
    calendar: "My Calendar",
    supervisors: "Browse Supervisors",
    mythesis: "My Thesis",
    createthesis: "Create Thesis",
    supervising: "Thesis Supervision",
    requests: "Supervision Requests",
    completed: "Completed Theses",
    account: "Account",
    profile: "My Profile",
    edit: "Edit Profile",
    contributions: "My Contributions",
    settings: "Settings",
    // Add more mappings as needed
  };

  return labelMap[segment] || segment.split('-').map(
    word => word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}