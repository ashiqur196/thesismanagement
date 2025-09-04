import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { thesisManagementService } from "../../services/thesisManagement";
import { supervisorManagementService } from "../../services/supervisorManagement";
import { useAuth } from "../../contexts/authContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getProfileImage } from "../../services/getPicture";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Mail,
  GraduationCap,
  Brain,
  FileText,
  LinkIcon,
  Send,
  Users,
  User,
  BookOpen,
  AlertCircle,
} from "lucide-react";

function Supervisor() {
  const { currentUser } = useAuth();
  const { id } = useParams();
  const [supervisor, setSupervisor] = useState(null);
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestError, setRequestError] = useState(null);
  const [reqLoading, setReqLoading] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [supervisorRes, thesesRes] = await Promise.all([
        supervisorManagementService.getSupervisorbyId(id),
        thesisManagementService.getMyThesisNoSupervisor(),
      ]);

      if (supervisorRes.success) {
        setSupervisor(supervisorRes.data.faculty);
      } else {
        setError(supervisorRes.message || "Failed to load supervisor");
      }

      if (thesesRes.success) {
        setTheses(thesesRes.data.theses || []);
      }
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDepartment = (dept) => {
    if (dept === "CSE") {
      return "Computer Science & Engineering";
    } else if (dept === "MNS") {
      return "Maths & Natural Science";
    } else if (dept === "EEE") {
      return "Electrical & Electronic Engineering";
    } else {
      return dept;
    }
  };

  const handleRequest = async () => {
    try {
      setRequestError("");
      setReqLoading(true);

      const res = await thesisManagementService.requestSupervisor({
        facultyId: parseInt(id),
        thesisId: parseInt(selectedThesis),
        message: message?.trim() || null,
      });

      if (res.success) {
        console.log("Supervisor request created:", res);
        setRequestOpen(false);
        setMessage("");
        setSelectedThesis("");
      } else {
        setRequestError(res.message || "Failed to send request");
      }
    } catch (err) {
      console.error("Request supervisor error:", err);
      setRequestError("Something went wrong. Please try again.");
    } finally {
      setReqLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <Skeleton className="h-12 w-1/2" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!supervisor) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>Supervisor not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      {/* Supervisor Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <Avatar className="h-20 w-20 shrink-0">
          <AvatarImage src={getProfileImage(supervisor.user?.image)} />
          <AvatarFallback className="text-2xl">
            {getInitials(supervisor.name)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1 text-center sm:text-left w-full">
          <h1 className="text-2xl sm:text-3xl font-bold break-words">
            {supervisor.name}
          </h1>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-muted-foreground">
            <div className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              <span>{getDepartment(supervisor.department)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              <span className="break-all">{supervisor.user?.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{supervisor.availableSlots} slots available</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 gap-y-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {supervisor.about || "No information available"}
              </p>
            </CardContent>
          </Card>

          {/* Research Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Research Interests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {supervisor.researchInterest?.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {interest}
                  </Badge>
                ))}
                {(!supervisor.researchInterest ||
                  supervisor.researchInterest.length === 0) && (
                  <span className="text-muted-foreground">
                    No research interests specified
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contributions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contributions
              </CardTitle>
              <CardDescription>
                Research papers and publications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supervisor.contributions?.map((contribution) => (
                  <div key={contribution.id} className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <h4 className="font-semibold">{contribution.title}</h4>
                      <span className="text-sm text-muted-foreground">
                        {new Date(contribution.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {contribution.subtitle}
                    </p>
                    <p className="text-sm">{contribution.description}</p>
                    {contribution.url && (
                      <a
                        href={contribution.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                      >
                        <LinkIcon className="h-3 w-3" />
                        View Publication
                      </a>
                    )}
                    <Separator />
                  </div>
                ))}
                {(!supervisor.contributions ||
                  supervisor.contributions.length === 0) && (
                  <p className="text-muted-foreground">
                    No contributions available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6 w-full">
          {/* Request Supervision */}
          {currentUser?.role === "STUDENT" && theses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Request Supervision
                </CardTitle>
                <CardDescription>
                  Send a request to this supervisor for your thesis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">Request Supervision</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] w-[95%]">
                    <DialogHeader>
                      <DialogTitle>Request Supervision</DialogTitle>
                      <DialogDescription>
                        Send a request to {supervisor.name} to supervise your
                        thesis work.
                      </DialogDescription>
                    </DialogHeader>

                    {/* Error Message */}
                    {requestError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{requestError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid gap-4 py-4">
                      <Select
                        value={selectedThesis}
                        onValueChange={setSelectedThesis}
                      >
                        <SelectTrigger className="w-full truncate">
                          <SelectValue placeholder="Select your thesis" />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          className="max-h-60 w-[var(--radix-select-trigger-width)]"
                        >
                          {theses.map((thesis) => (
                            <SelectItem
                              key={thesis.id}
                              value={thesis.id.toString()}
                            >
                              {thesis.title} ({thesis.Code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Textarea
                        placeholder="Optional message to the supervisor..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setRequestOpen(false)}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleRequest}
                        disabled={!selectedThesis || reqLoading}
                        className="w-full sm:w-auto"
                      >
                        {reqLoading ? "Sending..." : "Send Request"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {/* Theses without Supervisor */}
          {currentUser?.role === "STUDENT" && theses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Your Theses Without Supervisor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {theses.map((thesis) => (
                  <div key={thesis.id} className="p-3 border rounded-lg">
                    <h4 className="font-semibold">{thesis.title}</h4>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-muted-foreground gap-1">
                      <span>{thesis.Code}</span>
                      <span>
                        {new Date(thesis.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Non-students */}
          {currentUser?.role !== "STUDENT" && (
            <Card>
              <CardHeader>
                <CardTitle>Supervisor Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Only students can request supervision for their theses.
                </p>
              </CardContent>
            </Card>
          )}

          {/* No theses */}
          {currentUser?.role === "STUDENT" && theses.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>No Theses Available</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You don't have any theses without a supervisor. Create a
                  thesis first to request supervision.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default Supervisor;
