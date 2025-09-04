import React, { useState, useEffect } from "react";
import { thesisManagementService } from "../../../services/thesisManagement";
import { useThesis } from "../../../contexts/thesisContext";
import { toast } from "sonner";
import { getProfileImage } from "../../../services/getPicture";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trash2,
  User,
  Mail,
  BookOpen,
  Calendar,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

function Requests() {
  const { thesis } = useThesis();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingIds, setDeletingIds] = useState(new Set());

  useEffect(() => {
    fetchRequests();
  }, [thesis.id]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await thesisManagementService.getRequests(thesis.id);

      if (result.success) {
        setRequests(result.data.requests || []);
      } else {
        setError(result.message || "Failed to fetch requests");
        toast.error(result.message || "Failed to fetch requests");
        setRequests([]);
      }
    } catch (error) {
      const errorMsg =
        error.message || "An error occurred while fetching requests";
      setError(errorMsg);
      toast.error(errorMsg);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      setDeletingIds((prev) => new Set(prev).add(requestId));

      const result = await thesisManagementService.deleteRequest(requestId);

      if (result.success) {
        toast.success("Request deleted successfully");
        setRequests((prev) =>
          prev.filter((request) => request.id !== requestId)
        );
      } else {
        toast.error(result.message || "Failed to delete request");
      }
    } catch (error) {
      toast.error(
        error.message || "An error occurred while deleting the request"
      );
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "PENDING":
        return "secondary";
      case "ACCEPTED":
        return "default";
      case "REJECTED":
        return "destructive";
      case "DELETED":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Supervisor Requests
          </h2>
          <Skeleton className="h-9 w-20" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-full">
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-9 w-full mt-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Supervisor Requests
          </h2>
          <Button onClick={fetchRequests} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>

        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2 text-destructive">
              Failed to load requests
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchRequests}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          Supervisor Requests
        </h2>
        <Button onClick={fetchRequests} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No requests yet</h3>
            <p className="text-muted-foreground">
              You haven't sent any supervisor requests for your thesis yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <Card key={request.id} className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={getProfileImage(request.faculty.user.image)}
                        alt={request.faculty.name}
                      />
                      <AvatarFallback className="bg-primary/10">
                        <User className="h-6 w-6 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg leading-tight">
                        {request.faculty.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {request.faculty.department}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={getStatusVariant(request.status)}
                    className="shrink-0"
                  >
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Main content section */}
                <div className="space-y-3 text-sm flex-1">
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {request.faculty.user.email}
                    </span>
                  </div>

                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>{formatDate(request.createdAt)}</span>
                  </div>

                  {request.message && (
                    <div className="mt-3 p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">
                        {request.message}
                      </p>
                    </div>
                  )}

                  {request.faculty.researchInterest &&
                    request.faculty.researchInterest.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">
                          Research Interests:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {request.faculty.researchInterest.map(
                            (interest, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {interest}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>

                {/* Bottom-aligned delete button */}
                {request.status === "PENDING" && (
                  <div className="mt-auto pt-4 border-t">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleDeleteRequest(request.id)}
                      disabled={deletingIds.has(request.id)}
                    >
                      {deletingIds.has(request.id) ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Request
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Requests;
