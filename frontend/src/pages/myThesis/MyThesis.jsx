import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { thesisManagementService } from "../../services/thesisManagement";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function MyThesis() {
  const navigate = useNavigate();
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
  });

  const fetchTheses = async () => {
    try {
      setError("");
      setLoading(true);
      const query = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        status: filters.status !== "ALL" ? filters.status : undefined,
      };

      const response = await thesisManagementService.getMyThesis(query);

      if (response.success) {
        setTheses(response.data.theses || []);
        setPagination({
          page: response.data.page,
          totalPages: response.data.totalPages,
          totalItems: response.data.totalItems,
          limit: response.data.limit,
        });
      } else {
        setError(response.message || "Failed to fetch theses");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheses();
  }, [pagination.page, filters]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case "INACTIVE":
        return <Badge className="bg-gray-500 hover:bg-gray-600">Completed</Badge>;
      case "PENDING_SUPERVISOR":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getInitials = (name) => name[0].toUpperCase();

  const truncateTitle = (title) => title.length > 50 ? `${title.substring(0, 50)}...` : title;

  const viewThesisDetails = (thesisId) => navigate(`/thesis/${thesisId}`);

  if (loading && theses.length === 0) {
    return (
      <div className="container mx-auto space-y-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Skeleton className="h-10 w-full md:w-96" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto space-y-4">
        <h2 className="text-xl font-semibold">Error</h2>
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchTheses} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-4">
      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by title or code..."
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          className="w-full sm:w-96"
        />
        <Select
          name="status"
          value={filters.status}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Completed</SelectItem>
            <SelectItem value="PENDING_SUPERVISOR">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Thesis Cards Grid */}
      {theses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {theses.map((thesis) => (
            <Card key={thesis.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CardTitle className="text-lg line-clamp-3 text-left">
                        {thesis.title}
                      </CardTitle>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{thesis.title}</p>
                    </TooltipContent>
                  </Tooltip>
                  
                </div>
                {getStatusBadge(thesis.status)}
                <CardDescription className="mt-1">{thesis.Code}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                
                <div className="text-sm">
                  <span className="text-muted-foreground">Created: </span>
                  {format(new Date(thesis.createdAt), "MMM dd, yyyy")}
                </div>
                
                {thesis.supervisor && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Supervisor: </span>
                    <span className="line-clamp-1">{thesis.supervisor.name}</span>
                  </div>
                )}

                {thesis.members?.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Members:</p>
                    <div className="flex flex-wrap gap-1">
                      {thesis.members.map((member, index) => (
                        <Tooltip key={index}>
                          <TooltipTrigger>
                            <Avatar className="h-8 w-8 text-xs">
                              <AvatarFallback>
                                {getInitials(member.student.name)}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{member.student.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => viewThesisDetails(thesis.id)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 space-y-2">
          <p>No theses found</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilters({ search: "", status: "ALL" });
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        <div className="text-sm text-muted-foreground">
          Showing page {pagination.page} of {pagination.totalPages}
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
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
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    isActive={pageNum === pagination.page}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

export default MyThesis;