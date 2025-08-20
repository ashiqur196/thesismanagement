import { ThesisSidebar } from "./thesis-sidebar";
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
import { Outlet, useLocation, Navigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { ThesisProvider, useThesis } from "../contexts/thesisContext";
import { Fragment } from "react";
import { Loader2 } from "lucide-react";

// Wrapper component that handles thesis data loading and validation
function ThesisContent() {
  const { thesis, loading, error } = useThesis();
  const location = useLocation();
  const { currentUser } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading thesis data...</span>
      </div>
    );
  }

  if (error || !thesis) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold text-destructive">
          Error Loading Thesis
        </h2>
        <p className="text-muted-foreground mt-2">
          {error || "Thesis not found or you don't have access to it"}
        </p>

        {/* <Navigate to="/dashboard" replace /> */}
      </div>
    );
  }

  return (
    <>
      <header className="sticky bg-white top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {getBreadcrumbs(location.pathname, currentUser?.role, thesis).map(
                (crumb, index, array) => (
                  <Fragment key={crumb.href}>
                    <BreadcrumbItem>
                      {index === array.length - 1 ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href}>
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < array.length - 1 && <BreadcrumbSeparator />}
                  </Fragment>
                )
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Outlet />
      </div>
    </>
  );
}

export default function ThesisLayout() {
  const { thesisId } = useParams();

  // If no thesisId in URL, redirect to dashboard
  if (!thesisId) {
    return <Navigate to="/" replace />;
  }

  return (
    <ThesisProvider>
      <SidebarProvider>
        <ThesisSidebar />
        <SidebarInset>
          <ThesisContent />
        </SidebarInset>
      </SidebarProvider>
    </ThesisProvider>
  );
}

// Helper function to generate breadcrumbs
function getBreadcrumbs(pathname, role, thesis) {
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = [];

  // Add thesis breadcrumb if we have thesis data
  if (thesis) {
    breadcrumbs.push({
      href: `/thesis/${thesis.id}`,
      label: "Thesis Portal",
    });
  }

  // Map remaining path segments to breadcrumbs
  let currentPath = `/thesis/${thesis?.id || ""}`;
  for (let i = 2; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    currentPath += `/${segment}`;

    // Skip if this is the thesis ID segment (already handled above)
    if (i === 1) continue;

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
    tasks: "Tasks",
    resources: "Resources",
    meetings: "Meetings",
    settings: "Settings",
    edit: "Edit Thesis",
    collaborators: "Collaborators",
    delete: "Delete Thesis",
    // Add more mappings as needed
  };

  return (
    labelMap[segment] ||
    segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}
