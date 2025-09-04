import React, { useState, useEffect } from "react";
import { thesisManagementService } from "../../../services/thesisManagement";
import { useThesis } from "../../../contexts/thesisContext";
import { useAuth } from "../../../contexts/authContext";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../../../components/ui/dialog";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import {
  Search,
  Calendar,
  Clock,
  AlertCircle,
  Filter,
  FileText,
  Send,
  Upload,
  X,
  Loader2,
  Download,
  Eye,
  File,
  ChevronDown,
  ChevronUp,
  Edit,
  Star,
  Plus,
  Trash2,
} from "lucide-react";
import { Skeleton } from "../../../components/ui/skeleton";
import { getOriginalFileName } from "../../../lib/utils";
import { getDocument } from "../../../services/getDocument";

function ThesisTasks() {
  const { currentUser } = useAuth();
  const { thesis } = useThesis();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [submissionData, setSubmissionData] = useState({
    content: "",
    file: null,
  });
  const [feedbackData, setFeedbackData] = useState({
    feedback: "",
    grade: "",
  });
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [editTaskData, setEditTaskData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
  });
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [providingFeedback, setProvidingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [createTaskSuccess, setCreateTaskSuccess] = useState(false);
  const [createTaskError, setCreateTaskError] = useState(null);
  const [editingTask, setEditingTask] = useState(false);
  const [editTaskSuccess, setEditTaskSuccess] = useState(false);
  const [editTaskError, setEditTaskError] = useState(null);
  const [deletingTask, setDeletingTask] = useState(false);
  const [deleteTaskError, setDeleteTaskError] = useState(null);

  const isFaculty = currentUser.role === "FACULTY";

  useEffect(() => {
    fetchTasks();
  }, [filters, thesis.id]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await thesisManagementService.getTasks(
        filters,
        thesis.id
      );
      if (response.success) {
        setTasks(response.data.tasks);
      } else {
        setError(response.message || "Failed to fetch tasks");
      }
    } catch (error) {
      setError(error.message || "Failed to fetch tasks");
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, status: value, page: 1 }));
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setSubmitError("File size exceeds 10MB limit");
        return;
      }
      setSubmissionData((prev) => ({ ...prev, file }));
      setSubmitError(null);
    }
  };

  const removeFile = () => {
    setSubmissionData((prev) => ({ ...prev, file: null }));
  };

  const handleSubmitTask = async () => {
    if (!submissionData.content && !submissionData.file) {
      setSubmitError("Please provide either content or a file");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append("taskId", selectedTask.id);
      formData.append("content", submissionData.content);
      if (submissionData.file) {
        formData.append("document", submissionData.file);
      }

      const response = await thesisManagementService.postSubmission(formData);

      if (response.success) {
        setSubmissionData({ content: "", file: null });
        setSubmitSuccess(true);

        setTimeout(() => {
          setSubmitSuccess(false);
          setSelectedTask(null);
          fetchTasks();
        }, 2000);
      } else {
        setSubmitError(response.message || "Failed to submit task");
      }
    } catch (error) {
      setSubmitError(error.message || "Failed to submit task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProvideFeedback = async () => {
    if (!feedbackData.feedback && !feedbackData.grade) {
      setSubmitError("Please provide either feedback or a grade");
      return;
    }

    setProvidingFeedback(true);
    setSubmitError(null);

    try {
      const response = await thesisManagementService.provideFeedback(
        selectedSubmission.id,
        feedbackData
      );

      if (response.success) {
        setFeedbackData({ feedback: "", grade: "" });
        setFeedbackSuccess(true);

        setTimeout(() => {
          setFeedbackSuccess(false);
          setSelectedSubmission(null);
          fetchTasks();
        }, 2000);
      } else {
        setSubmitError(response.message || "Failed to provide feedback");
      }
    } catch (error) {
      setSubmitError(error.message || "Failed to provide feedback");
    } finally {
      setProvidingFeedback(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskData.title) {
      setCreateTaskError("Title is required");
      return;
    }

    setCreatingTask(true);
    setCreateTaskError(null);

    try {
      const response = await thesisManagementService.createTask({
        ...taskData,
        thesisId: thesis.id,
      });

      if (response.success) {
        setTaskData({ title: "", description: "", dueDate: "" });
        setCreateTaskSuccess(true);

        setTimeout(() => {
          setCreateTaskSuccess(false);
          fetchTasks();
        }, 2000);
      } else {
        setCreateTaskError(response.message || "Failed to create task");
      }
    } catch (error) {
      setCreateTaskError(error.message || "Failed to create task");
    } finally {
      setCreatingTask(false);
    }
  };

  const handleEditTask = async () => {
    if (!editTaskData.title) {
      setEditTaskError("Title is required");
      return;
    }

    setEditingTask(true);
    setEditTaskError(null);

    try {
      // Convert dueDate to UTC if it exists
      const payload = {
        ...editTaskData,
        dueDate: editTaskData.dueDate
          ? new Date(editTaskData.dueDate).toISOString()
          : null,
      };

      const response = await thesisManagementService.editTask(
        selectedTask.id,
        payload
      );

      if (response.success) {
        setEditTaskSuccess(true);

        setTimeout(() => {
          setEditTaskSuccess(false);
          setSelectedTask(null);
          fetchTasks();
        }, 2000);
      } else {
        setEditTaskError(response.message || "Failed to update task");
      }
    } catch (error) {
      setEditTaskError(error.message || "Failed to update task");
    } finally {
      setEditingTask(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    setDeletingTask(true);
    setDeleteTaskError(null);

    try {
      const response = await thesisManagementService.deleteTask(
        taskToDelete.id
      );

      if (response.success) {
        setTaskToDelete(null);
        fetchTasks();
      } else {
        setDeleteTaskError(response.message || "Failed to delete task");
      }
    } catch (error) {
      setDeleteTaskError(error.message || "Failed to delete task");
    } finally {
      setDeletingTask(false);
    }
  };

  const handleViewFile = (submission) => {
    if (!submission.fileUrl) return;
    window.open(
      getDocument(submission.fileUrl),
      "_blank",
      "noopener,noreferrer"
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusVariant = (status, dueDate) => {
    if (isOverdue(dueDate) && status === "PENDING") {
      return "destructive";
    }
    switch (status) {
      case "COMPLETED":
        return "default";
      case "PENDING":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusText = (status, dueDate) => {
    if (isOverdue(dueDate) && status === "PENDING") {
      return "OVERDUE";
    }
    switch (status) {
      case "PENDING":
        return "PENDING";
      case "COMPLETED":
        return "COMPLETED";
      default:
        return status;
    }
  };

  const openSubmissionDialog = (task) => {
    setSelectedTask(task);
    setSubmissionData({ content: "", file: null });
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const openFeedbackDialog = (submission) => {
    setSelectedSubmission(submission);
    setFeedbackData({
      feedback: submission.feedback || "",
      grade: submission.grade || "",
    });
    setSubmitError(null);
    setFeedbackSuccess(false);
  };

  const openCreateTaskDialog = () => {
    setTaskData({ title: "", description: "", dueDate: "" });
    setCreateTaskError(null);
    setCreateTaskSuccess(false);
  };

  const openEditTaskDialog = (task) => {
    setSelectedTask(task);
    setEditTaskData({
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().slice(0, 16)
        : "",
    });
    setEditTaskError(null);
    setEditTaskSuccess(false);
  };

  const openDeleteTaskDialog = (task) => {
    setTaskToDelete(task);
    setDeleteTaskError(null);
  };

  const canEditTask = (task) => {
    return isFaculty && task.status === "PENDING";
  };

  return (
    <div className="container mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Thesis Tasks</h1>
        {isFaculty && (
          <Dialog>
            <DialogTrigger asChild>
              <Button onClick={openCreateTaskDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Create a new task for your thesis students
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter task title"
                    value={taskData.title}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        title: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter task description"
                    value={taskData.description}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        description: e.target.value,
                      })
                    }
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={taskData.dueDate}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        dueDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {createTaskError && <ErrorAlert error={createTaskError} />}

              {createTaskSuccess && (
                <SuccessAlert message={"Task created successfully!"} />
              )}

              <DialogFooter>
                <Button
                  onClick={handleCreateTask}
                  disabled={creatingTask}
                  className="w-full sm:w-auto"
                >
                  {creatingTask ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Task
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 rounded-lg">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-9"
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && tasks.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No tasks found</h3>
          <p className="text-muted-foreground">
            {filters.search || filters.status
              ? "Try adjusting your search or filter criteria"
              : "No tasks have been assigned yet"}
          </p>
        </div>
      )}

      {/* Tasks */}
      {!loading && tasks.length > 0 && (
        <div className="grid gap-6">
          {tasks.map((task) => {
            const isExpanded = expandedTaskId === task.id;
            return (
              <Card
                key={task.id}
                className={`transition hover:shadow-lg ${
                  task.status === "COMPLETED" ? "opacity-85" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <CardTitle className="text-xl">{task.title}</CardTitle>
                      <CardDescription>
                        Assigned by {task.faculty.name} (
                        {task.faculty.department})
                      </CardDescription>
                    </div>
                    <Badge
                      variant={getStatusVariant(task.status, task.dueDate)}
                    >
                      {getStatusText(task.status, task.dueDate)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p
                    className={
                      !task.description ? "text-muted-foreground italic" : ""
                    }
                  >
                    {task.description || "No description provided"}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Due: {formatDate(task.dueDate)}</span>
                    </div>
                    {isOverdue(task.dueDate) && (
                      <div className="flex items-center text-destructive">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>Overdue</span>
                      </div>
                    )}
                  </div>

                  {/* Expand submissions */}
                  {task.submissions && task.submissions.length > 0 && (
                    <div className="border-t pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-sm"
                        onClick={() =>
                          setExpandedTaskId(isExpanded ? null : task.id)
                        }
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Hide Submissions
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            View Submissions ({task.submissions.length})
                          </>
                        )}
                      </Button>

                      {isExpanded && (
                        <div className="mt-3 space-y-4">
                          {task.submissions.map((submission) => (
                            <div
                              key={submission.id}
                              className="rounded-lg border bg-gradient-to-br from-muted/40 to-muted/10 p-4"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Clock className="h-4 w-4 mr-1 text-blue-500" />
                                  <span>
                                    {formatDateTime(submission.submittedAt)}
                                  </span>
                                </div>
                                {submission.grade && (
                                  <Badge className="bg-green-100 text-green-800">
                                    Grade: {submission.grade}
                                  </Badge>
                                )}
                              </div>

                              {submission.content && (
                                <div className="mb-2">
                                  <p className="text-sm font-medium">Content</p>
                                  <p className="bg-muted/20 rounded p-2 text-sm">
                                    {submission.content}
                                  </p>
                                </div>
                              )}

                              {submission.fileUrl && (
                                <div className="flex justify-between items-center bg-white dark:bg-muted/30 border rounded-lg p-2">
                                  <div className="flex items-center gap-2">
                                    <File className="h-4 w-4 text-blue-500" />
                                    <span className="truncate max-w-[150px] text-sm">
                                      {getOriginalFileName(submission.fileUrl)}
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleViewFile(submission)}
                                    >
                                      <Eye className="h-4 w-4 mr-1" /> View
                                    </Button>
                                    <Button
                                      asChild
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center gap-1"
                                    >
                                      <a
                                        href={getDocument(submission.fileUrl)}
                                        download={
                                          getOriginalFileName(
                                            submission.fileUrl
                                          ) || "file"
                                        }
                                        rel="noopener noreferrer"
                                      >
                                        <Download className="h-4 w-4" />
                                        <span>Download</span>
                                      </a>
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {submission.feedback && (
                                <div className="mt-3">
                                  <p className="flex items-center gap-1 text-sm font-medium text-blue-700">
                                    <AlertCircle className="h-4 w-4" />
                                    Feedback
                                  </p>
                                  <p className="bg-blue-50 text-blue-800 dark:bg-blue-900/30 rounded p-2 text-sm">
                                    {submission.feedback}
                                  </p>
                                </div>
                              )}

                              {/* Faculty actions */}
                              {isFaculty && (
                                <div className="mt-3 flex justify-end">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          openFeedbackDialog(submission)
                                        }
                                      >
                                        <Star className="h-4 w-4 mr-1" />
                                        {submission.feedback
                                          ? "Edit Feedback"
                                          : "Provide Feedback"}
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                      <DialogHeader>
                                        <DialogTitle>
                                          {submission.feedback
                                            ? "Edit Feedback"
                                            : "Provide Feedback"}
                                        </DialogTitle>
                                        <DialogDescription>
                                          Provide feedback and grade for this
                                          submission
                                        </DialogDescription>
                                      </DialogHeader>

                                      <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                          <Label htmlFor="feedback">
                                            Feedback
                                          </Label>
                                          <Textarea
                                            id="feedback"
                                            placeholder="Provide your feedback..."
                                            value={feedbackData.feedback}
                                            onChange={(e) =>
                                              setFeedbackData({
                                                ...feedbackData,
                                                feedback: e.target.value,
                                              })
                                            }
                                            className="min-h-[100px]"
                                          />
                                        </div>

                                        <div className="grid gap-2">
                                          <Label htmlFor="grade">
                                            Grade (optional)
                                          </Label>
                                          <Input
                                            id="grade"
                                            type="number"
                                            min="0"
                                            max="100"
                                            placeholder="Enter grade (0-100)"
                                            value={feedbackData.grade}
                                            onChange={(e) =>
                                              setFeedbackData({
                                                ...feedbackData,
                                                grade: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                      </div>

                                      {submitError && (
                                        <ErrorAlert error={submitError} />
                                      )}

                                      {feedbackSuccess && (
                                        <SuccessAlert
                                          message={
                                            "Feedback submitted successfully!"
                                          }
                                        />
                                      )}

                                      <DialogFooter>
                                        <Button
                                          onClick={handleProvideFeedback}
                                          disabled={providingFeedback}
                                          className="w-full sm:w-auto"
                                        >
                                          {providingFeedback ? (
                                            <>
                                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                              Submitting...
                                            </>
                                          ) : (
                                            <>
                                              <Send className="h-4 w-4 mr-2" />
                                              Submit Feedback
                                            </>
                                          )}
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex justify-end gap-2">
                  {!isFaculty ? (
                    // Student view - submit button
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => openSubmissionDialog(task)}
                          disabled={task.status === "COMPLETED"}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Submit Work
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>
                            Submit work for: {task?.title}
                          </DialogTitle>
                          <DialogDescription>
                            Provide your content and/or upload a file (max 10MB)
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                              id="content"
                              placeholder="Describe your submission..."
                              value={submissionData.content}
                              onChange={(e) =>
                                setSubmissionData({
                                  ...submissionData,
                                  content: e.target.value,
                                })
                              }
                              className="min-h-[100px]"
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="file">File (optional)</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="file"
                                type="file"
                                onChange={handleFileChange}
                                className="flex-1"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={removeFile}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            {submissionData.file && (
                              <p className="text-sm flex items-center gap-1 text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                {submissionData.file.name}
                              </p>
                            )}
                          </div>
                        </div>

                        {submitError && <ErrorAlert error={submitError} />}

                        {submitSuccess && (
                          <SuccessAlert message={"Submission successful!"} />
                        )}

                        <DialogFooter>
                          <Button
                            onClick={handleSubmitTask}
                            disabled={submitting}
                            className="w-full sm:w-auto"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Submit
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    // Faculty view - edit and delete buttons
                    <div className="flex gap-2">
                      {canEditTask(task) && (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                onClick={() => openEditTaskDialog(task)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Task
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>Edit Task</DialogTitle>
                                <DialogDescription>
                                  Update task details
                                </DialogDescription>
                              </DialogHeader>

                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-title">Title *</Label>
                                  <Input
                                    id="edit-title"
                                    placeholder="Enter task title"
                                    value={editTaskData.title}
                                    onChange={(e) =>
                                      setEditTaskData({
                                        ...editTaskData,
                                        title: e.target.value,
                                      })
                                    }
                                  />
                                </div>

                                <div className="grid gap-2">
                                  <Label htmlFor="edit-description">
                                    Description
                                  </Label>
                                  <Textarea
                                    id="edit-description"
                                    placeholder="Enter task description"
                                    value={editTaskData.description}
                                    onChange={(e) =>
                                      setEditTaskData({
                                        ...editTaskData,
                                        description: e.target.value,
                                      })
                                    }
                                    className="min-h-[100px]"
                                  />
                                </div>

                                <div className="grid gap-2">
                                  <Label htmlFor="edit-dueDate">Due Date</Label>
                                  <Input
                                    id="edit-dueDate"
                                    type="datetime-local"
                                    value={editTaskData.dueDate}
                                    onChange={(e) =>
                                      setEditTaskData({
                                        ...editTaskData,
                                        dueDate: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>

                              {editTaskError && (
                                <ErrorAlert error={editTaskError} />
                              )}

                              {editTaskSuccess && (
                                <SuccessAlert
                                  message={"Task updated successfully!"}
                                />
                              )}

                              <DialogFooter>
                                <Button
                                  onClick={handleEditTask}
                                  disabled={editingTask}
                                  className="w-full sm:w-auto"
                                >
                                  {editingTask ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Updating...
                                    </>
                                  ) : (
                                    <>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Update Task
                                    </>
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                onClick={() => openDeleteTaskDialog(task)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] flex flex-col">
                              <DialogHeader>
                                <DialogTitle>Confirm Deletion</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete the task "
                                  {task.title}"? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>

                              {deleteTaskError && (
                                <ErrorAlert error={deleteTaskError} />
                              )}

                              <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                  <Button variant="outline" type="button">
                                    Cancel
                                  </Button>
                                </DialogClose>
                                <Button
                                  variant="destructive"
                                  onClick={handleDeleteTask}
                                  disabled={deletingTask}
                                >
                                  {deletingTask ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Task
                                    </>
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      {/* Pagination */}
      {!loading && tasks.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <p className="text-sm text-muted-foreground">Page {filters.page}</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page === 1}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={tasks.length < filters.limit}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThesisTasks;

function ErrorAlert({ error }) {
  return (
    <div className="my-2 w-full p-2 bg-red-50 text-red-800 border rounded-md border-red-200 ">
      <AlertCircle className="h-4 w-4 text-red-800" />
      <p>{error}</p>
    </div>
  );
}
function SuccessAlert({ message }) {
  return (
    <div className="my-2 w-full p-2 bg-green-50 text-green-800 border rounded-md border-green-200">
      <AlertCircle className="h-4 w-4 text-green-800" />
      <p>{message}</p>
    </div>
  );
}
