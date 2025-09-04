import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  User,
  Mail,
  BookOpen,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { supervisorManagementService } from "../../services/supervisorManagement";
import { getProfileImage } from "../../services/getPicture";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";

function BrowseSupervisors() {
  const navigate = useNavigate();
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    totalPages: 1,
    totalItems: 0,
  });

  useEffect(() => {
    fetchSupervisors();
  }, [searchQuery, departmentFilter, pagination.page, pagination.limit]);

  const fetchSupervisors = async () => {
    try {
      setLoading(true);
      const query = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (searchQuery) {
        query.search = searchQuery;
      }

      if (departmentFilter !== "all") {
        query.department = departmentFilter;
      }

      const response = await supervisorManagementService.getSupervisor(query);

      if (response.success) {
        setSupervisors(response.data.faculties || []);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.data.totalPages || 1,
          totalItems: response.data.totalItems || 0,
        }));
      } else {
        setError(response.message || "Failed to fetch supervisors");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentName = (dept) => {
    const departmentMap = {
      CSE: "Computer Science & Engineering",
      MNS: "Maths & Natural Science",
      EEE: "Electronics & Electrical Engineering",
    };
    return departmentMap[dept] || dept;
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewProfile = (supervisorId) => {
    // Handle view profile action
    navigate(`/supervisors/${supervisorId}`);

  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleLimitChange = (newLimit) => {
    setPagination((prev) => ({ ...prev, limit: parseInt(newLimit), page: 1 }));
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      pagination.page - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(
      pagination.totalPages,
      startPage + maxVisiblePages - 1
    );

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Browse Supervisors
        </h1>
        <p className="text-muted-foreground">
          Find and connect with faculty members for research supervision
        </p>
      </div>

      {/* Filters and pagination controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-[180px]">
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="CSE">Computer Science</SelectItem>
                <SelectItem value="MNS">Maths & Science</SelectItem>
                <SelectItem value="EEE">Electrical Engineering</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Show:
          </span>
          <Select
            value={pagination.limit.toString()}
            onValueChange={handleLimitChange}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6</SelectItem>
              <SelectItem value="9">9</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="15">15</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            per page
          </span>
        </div>
      </div>

      {/* Results count */}
      {!loading && !error && (
        <div className="text-sm text-muted-foreground">
          Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
          {Math.min(pagination.page * pagination.limit, pagination.totalItems)}{" "}
          of {pagination.totalItems} supervisors
        </div>
      )}

      {/* Results */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive text-center">
              <p>Error: {error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={fetchSupervisors}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(pagination.limit)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[100px]" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : supervisors.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {supervisors.map((supervisor) => (
              <Card key={supervisor.id} className="flex flex-col h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={getProfileImage(supervisor.user?.image)}
                        alt={supervisor.name}
                      />
                      <AvatarFallback>
                        {getInitials(supervisor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {supervisor.name}
                      </CardTitle>
                      <Badge variant="outline">
                        {getDepartmentName(supervisor.department)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  {supervisor.about && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {supervisor.about}
                    </p>
                  )}

                  {supervisor.researchInterest &&
                    supervisor.researchInterest.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center text-sm font-medium">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Research Interests
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {supervisor.researchInterest.map(
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

                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {supervisor.user?.email || "Email not available"}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {supervisor.availableSlots || 0} slots available
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleViewProfile(supervisor.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination using shadcn components */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination>
                <PaginationContent>
                  {/* First Page Button */}
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(1)}
                      className={
                        pagination.page === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {/* Previous Page Button */}
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="h-9 w-9"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </PaginationItem>

                  {/* Page Numbers */}
                  {generatePageNumbers().map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={pagination.page === pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {/* Next Page Button */}
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="h-9 w-9"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>

                  {/* Last Page Button */}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(pagination.totalPages)}
                      className={
                        pagination.page === pagination.totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No supervisors found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default BrowseSupervisors;
