import React, { useState, useEffect } from "react";
import { supervisorManagementService } from "../../services/supervisorManagement";
import { getProfileImage } from "../../services/getPicture";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  Users,
  Calendar,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

function SupervisingThesis() {
  const navigate = useNavigate();
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false,
  });

  const fetchActiveTheses = async (page = 1, search = "") => {
    try {
      setLoading(true);
      setError(null);
      const data = await supervisorManagementService.getActiveTheses({
        page,
        limit: 10,
        search,
      });

      if (data.success) {
        setTheses(data.data.theses || []);
        setPagination(
          data.data.pagination || {
            page: 1,
            totalPages: 1,
            totalItems: 0,
            limit: 10,
            hasNext: false,
            hasPrev: false,
          }
        );
      } else {
        setError(data.message || "Failed to fetch active theses");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching active theses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTheses(1, searchQuery);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchActiveTheses(1, searchQuery);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchActiveTheses(newPage, searchQuery);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && theses.length === 0) {
    return (
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Supervising Theses
          </h1>
          <p className="text-muted-foreground mt-2">
            Theses you are currently supervising
          </p>
        </div>

        <div className="mb-6">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>

        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-20" />
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
            <Button
              onClick={() => fetchActiveTheses(1, searchQuery)}
              className="flex items-center gap-2"
            >
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
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Supervising Theses
          </h1>
          <p className="text-muted-foreground mt-2">
            {theses.length > 0
              ? `You are supervising ${pagination.totalItems} active thesis${
                  pagination.totalItems !== 1 ? "es" : ""
                }`
              : "No active theses found"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchActiveTheses(pagination.page, searchQuery)}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by title, code, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {theses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-20 w-20 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium mb-2">No active theses</h3>
            <p className="text-muted-foreground max-w-md">
              {searchQuery
                ? "No active theses match your search criteria."
                : "You are not currently supervising any active theses."}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  fetchActiveTheses(1, "");
                }}
              >
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6">
            {theses.map((thesis) => (
              <Card
                key={thesis.id}
                className="overflow-hidden transition-all hover:shadow-lg border-l-4 border-l-primary"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 line-clamp-2">
                        {thesis.title}
                      </CardTitle>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="secondary" className="capitalize">
                          {thesis.status.toLowerCase()}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Created {formatDate(thesis.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
                    <div className="space-y-4 flex-1">
                      {thesis.researchTags &&
                        thesis.researchTags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {thesis.researchTags
                              .slice(0, 4)
                              .map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs py-1"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            {thesis.researchTags.length > 4 && (
                              <Badge
                                variant="secondary"
                                className="text-xs py-1"
                              >
                                +{thesis.researchTags.length - 4} more
                              </Badge>
                            )}
                          </div>
                        )}

                      <div className="flex items-center gap-4">
                        <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex items-center">
                          <TooltipProvider>
                            <div className="flex -space-x-2">
                              {thesis.members.slice(0, 5).map((member) => (
                                <Tooltip key={member.id}>
                                  <TooltipTrigger asChild>
                                    <Avatar className="h-8 w-8 border-2 border-background hover:scale-110 transition-transform">
                                      <AvatarImage
                                        src={getProfileImage(member.user.image)}
                                        alt={member.name}
                                      />
                                      <AvatarFallback className="text-xs bg-gray-200">
                                        {member.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{member.name}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                              {thesis.members.length > 5 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                                      +{thesis.members.length - 5}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      And {thesis.members.length - 5} more
                                      members
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TooltipProvider>
                          <span className="text-sm text-muted-foreground ml-2">
                            {thesis.members.length} member
                            {thesis.members.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 self-start lg:self-center">
                      <Button
                        onClick={() =>
                          navigate(`/thesis/${thesis.id}`)
                        }
                        className="flex items-center gap-2"
                        variant="outline"
                      >
                        <FileText className="h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          pagination.page === pageNum ? "default" : "outline"
                        }
                        size="icon"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-10 h-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                )}

                {pagination.totalPages > 5 &&
                  pagination.page < pagination.totalPages - 2 && (
                    <span className="px-2 text-muted-foreground">...</span>
                  )}
              </div>

              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>

              <span className="text-sm text-muted-foreground ml-4 hidden md:block">
                Page {pagination.page} of {pagination.totalPages} •{" "}
                {pagination.totalItems} items
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SupervisingThesis;
