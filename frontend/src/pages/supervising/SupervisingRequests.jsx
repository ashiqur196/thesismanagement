import React, { useState, useEffect } from "react";
import { supervisorManagementService } from "../../services/supervisorManagement";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  BookOpen,
  Eye,
  Calendar,
  Tag,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  XCircle,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function SupervisingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState({});

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supervisorManagementService.getRequests();

      if (data.success) {
        setRequests(data.data.requests || []);
      } else {
        setError(data.message || "Failed to fetch requests");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleViewThesis = (thesisId) => {
    console.log(`View thesis with ID: ${thesisId}`);
    // Navigation will be implemented later
  };

  const handleAcceptRequest = async (requestId) => {
    setProcessing((prev) => ({ ...prev, [requestId]: "accepting" }));
    try {
      const result = await supervisorManagementService.acceptRequest(requestId);

      if (result.success) {
        // Remove the accepted request from the array
        setRequests((prev) => prev.filter((req) => req.id !== requestId));
        toast.success("Request accepted successfully!");
      } else {
        toast.error(result.message || "Failed to accept request");
      }
    } catch (err) {
      console.error("Failed to accept request:", err);
      toast.error("Failed to accept request");
    } finally {
      setProcessing((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleRejectRequest = async (requestId) => {
    setProcessing((prev) => ({ ...prev, [requestId]: "rejecting" }));
    try {
      const result = await supervisorManagementService.rejectRequest(requestId);

      if (result.success) {
        // Remove the rejected request from the array
        setRequests((prev) => prev.filter((req) => req.id !== requestId));
        toast.success("Request rejected successfully!");
      } else {
        toast.error(result.message || "Failed to reject request");
      }
    } catch (err) {
      console.error("Failed to reject request:", err);
      toast.error("Failed to reject request");
    } finally {
      setProcessing((prev) => ({ ...prev, [requestId]: false }));
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
      case "APPROVED":
        return "default";
      case "REJECTED":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Supervision Requests
          </h1>
          <p className="text-muted-foreground mt-2">
            Thesis requests awaiting your response
          </p>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-1/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-20 rounded-md" />
                    <Skeleton className="h-9 w-20 rounded-md" />
                  </div>
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
      <div className="container mx-auto">
        <Card className="border-destructive">
          <CardHeader className="text-destructive">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <Button onClick={fetchRequests} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Supervision Requests
          </h1>
          <p className="text-muted-foreground mt-2">
            {requests.length > 0
              ? `You have ${requests.length} thesis request${
                  requests.length !== 1 ? "s" : ""
                } awaiting your response`
              : "No pending thesis requests"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchRequests}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No pending requests</h3>
            <p className="text-muted-foreground max-w-md">
              When students request you as their thesis supervisor, those
              requests will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card
              key={request.id}
              className="overflow-hidden transition-all hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl flex items-center gap-2 mb-2">
                      {request.thesis.title}
                    </CardTitle>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge
                        variant={getStatusVariant(request.status)}
                        className="capitalize"
                      >
                        {request.status.toLowerCase()}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Requested {formatDate(request.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {request.status === "PENDING" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewThesis(request.thesisId)}
                          className="flex items-center gap-2"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4" />
                          View Thesis
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {request.message && (
                  <CardDescription className="mt-3 p-3 bg-muted/50 rounded-md">
                    "{request.message}"
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="space-y-2">
                    {request.thesis.researchTags &&
                      request.thesis.researchTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {request.thesis.researchTags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs flex items-center"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        Thesis created on {formatDate(request.thesis.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {request.status === "PENDING" && (
                      <>
                        <Button
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={processing[request.id]}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                          {processing[request.id] === "accepting" ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={processing[request.id]}
                          variant="destructive"
                          className="flex items-center gap-2"
                        >
                          {processing[request.id] === "rejecting" ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default SupervisingRequests;
