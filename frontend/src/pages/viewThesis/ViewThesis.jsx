import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { thesisManagementService } from "../../services/thesisManagement";
import { getProfileImage } from "../../services/getPicture";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  User,
  Users,
  BookOpen,
  ChevronRight,
  Mail,
  GraduationCap,
} from "lucide-react";

function ViewThesis() {
  const { thesisId } = useParams();
  const [thesis, setThesis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchThesis = async () => {
      try {
        setLoading(true);
        const data = await thesisManagementService.getThesisbyIdPublic(
          thesisId
        );

        if (data.success) {
          setThesis(data.thesis);
        } else {
          setError(data.message || "Failed to fetch thesis");
        }
      } catch (err) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (thesisId) {
      fetchThesis();
    }
  }, [thesisId]);

  const handleViewProfile = (userId, userType) => {
    console.log(`View profile of ${userType} with ID: ${userId}`);
    // Will be implemented later
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!thesis) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Thesis Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested thesis could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {thesis.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Created {formatDate(thesis.createdAt)}</span>
          </div>
          <Badge variant="outline" className="capitalize">
            {thesis.status.replace("_", " ").toLowerCase()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-justify leading-relaxed">
                {thesis.description}
              </p>
            </CardContent>
          </Card>

          {/* Research Tags Card */}
          {thesis.researchTags && (
            <Card>
              <CardHeader>
                <CardTitle>Research Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {thesis.researchTags.split(";").map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Members Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
                <Badge variant="secondary" className="ml-2">
                  {thesis.members.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {thesis.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={getProfileImage(member.student.user.image)}
                        alt={member.student.name}
                      />
                      <AvatarFallback>
                        {member.student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {member.student.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.student.department}
                        {member.creator && (
                          <span className="ml-2 text-primary">(Creator)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleViewProfile(member.student.userId, "student")
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Supervisor Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Supervisor
              </CardTitle>
              <CardDescription>
                {thesis.supervisor
                  ? "Thesis supervisor"
                  : "No supervisor assigned yet"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {thesis.supervisor ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={getProfileImage(thesis.supervisor.user.image)}
                        alt={thesis.supervisor.name}
                      />
                      <AvatarFallback>
                        {thesis.supervisor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {thesis.supervisor.name}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {thesis.supervisor.user?.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleViewProfile(thesis.supervisor.userId, "supervisor")
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No supervisor assigned</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ViewThesis;
