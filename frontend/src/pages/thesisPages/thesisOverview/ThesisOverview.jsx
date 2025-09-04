import React from "react";
import { useThesis } from "../../../contexts/thesisContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Calendar, Tag, FileText, ClipboardList } from "lucide-react";
import { Separator } from "../../../components/ui/separator";
import { thesisManagementService } from "../../../services/thesisManagement";

function Header({ thesis }) {
  if (!thesis) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusVariant = (status) => {
    const statusVariants = {
      ACTIVE: "default",
      INACTIVE: "secondary",
      PENDING_SUPERVISOR: "outline",
    };
    return statusVariants[status] || "secondary";
  };

  const formatStatus = (status) => {
    return status
      .toLowerCase()
      .replace("_", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Card className="mb-8 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader className="pb-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {thesis.title}
            </CardTitle>
          </div>
          <Badge
            variant={getStatusVariant(thesis.status)}
            className="text-[12px] sm:text-sm px-2 py-1 sm:px-4 sm:py-2"
          >
            {formatStatus(thesis.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {thesis.description && (
          <div className="flex flex-col items-start gap-4 p-2 sm:p-4 bg-muted/30 rounded-lg">
            <FileText className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-lg text-justify">
              {thesis.description}
            </p>
          </div>
        )}

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3 p-4 bg-background rounded-lg border">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Created On</p>
              <p className="font-semibold">{formatDate(thesis.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-background rounded-lg border">
            <ClipboardList className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Thesis Code</p>
              <p className="font-semibold font-mono">{thesis.Code}</p>
            </div>
          </div>
        </div>

        {thesis.researchTags && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Research Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {thesis.researchTags.split(";").map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm"
                >
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ThesisOverview() {
  const { thesis, loading } = useThesis();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!thesis) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No thesis data available</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8">
      <Header thesis={thesis} />

      {/* Task Statistics Component - Will fetch its own data */}
      <TaskStats thesisId={thesis.id} />

      {/* Additional content sections can be added here */}
      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <CardDescription>
            Welcome to your thesis management dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use this space to manage your research project, track progress, and
            collaborate with your team.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function TaskStats({ thesisId }) {
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchTaskStats = async () => {
      try {
        setLoading(true);
        const result = await thesisManagementService.getTaskStats(thesisId);
        
        // Check if the API returned an error response
        if (result.success === false) {
          setError(result.message || "Failed to fetch task statistics");
        } else if (result.data) {
          // Use the data from the response
          setStats(result.data);
          setError(null);
        } else {
          // Handle case where response structure is unexpected
          setError("Unexpected response format from server");
        }
      } catch (err) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (thesisId) {
      fetchTaskStats();
    }
  }, [thesisId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Statistics</CardTitle>
          <CardDescription>Loading task statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Statistics</CardTitle>
          <CardDescription>Error loading statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-destructive">
            <p>{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please try again later
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Statistics</CardTitle>
          <CardDescription>No statistics available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8 text-muted-foreground">
            No task statistics found for this thesis
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate completion percentage
  const completionPercentage = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Statistics</CardTitle>
        <CardDescription>
          Overview of task progress for this thesis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Tasks */}
          <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
            <div className="text-3xl font-bold text-primary mb-2">
              {stats.totalTasks || 0}
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Total Tasks
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.completedTasks || 0}
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Completed Tasks
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
            <div className="text-3xl font-bold text-amber-600 mb-2">
              {stats.pendingTasks || 0}
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Pending Tasks
            </div>
          </div>

          {/* Completion Percentage */}
          <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {completionPercentage}%
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Completion Rate
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {stats.totalTasks > 0 && (
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Progress
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ThesisOverview;
