import React, { useState, useEffect } from "react";
import { useThesis } from "../../../contexts/thesisContext";
import { useAuth } from "../../../contexts/authContext";
import { thesisManagementService } from "../../../services/thesisManagement";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit,
  User,
  BookOpen,
  CalendarIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

// Helper functions for time conversion
const convertToUTC = (localDate) => {
  return new Date(
    localDate.getTime() - localDate.getTimezoneOffset() * 60000
  ).toISOString();
};

const convertUTCToLocal = (utcString) => {
  if (!utcString) return null;
  const date = new Date(utcString);
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
};

const formatDateTime = (date) => {
  if (!date) return "Not scheduled";
  return format(date, "PPpp");
};

function ThesisAppointments() {
  const { thesis } = useThesis();
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form states
  const [message, setMessage] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editTime, setEditTime] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, [thesis.id]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await thesisManagementService.getAppointments(thesis.id);
      if (response.success) {
        // Convert UTC times to local time for display
        const appointmentsWithLocalTime = response.data.map((appt) => ({
          ...appt,
          localTime: appt.time ? convertUTCToLocal(appt.time) : null,
        }));
        setAppointments(appointmentsWithLocalTime);
      } else {
        toast.error("Failed to fetch appointments");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAppointment = async () => {
    try {
      if (!message.trim()) {
        toast.error("Please enter a message");
        return;
      }

      const appointmentData = {
        thesisId: thesis.id,
        message: message.trim(),
        time: selectedTime ? convertToUTC(new Date(selectedTime)) : null,
      };

      const response = await thesisManagementService.createAppointment(
        appointmentData
      );

      if (response.success) {
        toast.success("Appointment request sent successfully");
        setMessage("");
        setSelectedTime("");
        setIsCreating(false);
        fetchAppointments();
      } else {
        toast.error(response.message || "Failed to create appointment");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Failed to create appointment");
    }
  };

  const handleUpdateAppointment = async () => {
    if (!editingAppointment) return;

    try {
      setIsUpdating(true);
      const updateData = { status: editStatus };
      if (editTime) {
        updateData.time = convertToUTC(new Date(editTime));
      }

      const response = await thesisManagementService.updateAppointment(
        editingAppointment.id,
        updateData
      );

      if (response.success) {
        toast.success("Appointment updated successfully");
        setEditingAppointment(null);
        setEditStatus("");
        setEditTime("");
        fetchAppointments();
      } else {
        toast.error(response.message || "Failed to update appointment");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Failed to update appointment");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      const response = await thesisManagementService.deleteAppointment(
        appointmentId
      );

      if (response.success) {
        toast.success("Appointment deleted successfully");
        fetchAppointments();
      } else {
        toast.error(response.message || "Failed to delete appointment");
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Failed to delete appointment");
    }
  };

  const openEditDialog = (appointment) => {
    setEditingAppointment(appointment);
    setEditStatus(appointment.status);
    setEditTime(
      appointment.time
        ? format(new Date(appointment.time), "yyyy-MM-dd'T'HH:mm")
        : ""
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Thesis Appointments
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage appointments for: {thesis.title}
          </p>
        </div>

        {currentUser.role === "STUDENT" && (
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Request Appointment</DialogTitle>
                <DialogDescription>
                  Send a request to schedule an appointment with your
                  supervisor.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="message">Message to Supervisor</Label>
                  <Textarea
                    id="message"
                    placeholder="Explain the purpose of this meeting..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="time">Suggested Time (Optional)</Label>
                  <Input
                    id="time"
                    type="datetime-local"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your supervisor will confirm or suggest a different time
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAppointment}>Send Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {appointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No appointments yet</h3>
            <p className="text-muted-foreground mb-4">
              {currentUser.role === "STUDENT"
                ? "Schedule a meeting with your supervisor to discuss your thesis progress."
                : "No appointment requests have been made yet."}
            </p>
            {currentUser.role === "STUDENT" && (
              <Button onClick={() => setIsCreating(true)} className="gap-2">
                <Plus size={16} />
                Schedule Your First Appointment
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen size={18} className="text-primary" />
                      Thesis Discussion
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Appointment with {appointment.faculty?.name}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      appointment.status === "ACCEPTED"
                        ? "default"
                        : appointment.status === "PENDING"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {appointment.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid gap-3">
                  <div className="flex items-start gap-2">
                    <Clock size={16} className="mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Scheduled Time</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.localTime
                          ? formatDateTime(appointment.localTime)
                          : "Not scheduled yet"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CalendarIcon
                      size={16}
                      className="mt-1 text-muted-foreground"
                    />
                    <div>
                      <p className="text-sm font-medium">Message</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.message}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 bg-muted/50 p-4">
                <div className="text-xs text-muted-foreground">
                  Created{" "}
                  {formatDateTime(convertUTCToLocal(appointment.createdAt))}
                </div>

                <div className="flex gap-2">
                  {currentUser.role === "FACULTY" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(appointment)}
                        >
                          <Edit size={14} className="mr-1" />
                          Update
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Update Appointment</DialogTitle>
                          <DialogDescription>
                            Update the status and time for this appointment.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <Select
                              value={editStatus}
                              onValueChange={setEditStatus}
                            >
                              <SelectTrigger id="edit-status">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="ACCEPTED">
                                  Accepted
                                </SelectItem>
                                <SelectItem value="REJECTED">
                                  Rejected
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="edit-time">Scheduled Time</Label>
                            <Input
                              id="edit-time"
                              type="datetime-local"
                              value={editTime}
                              onChange={(e) => setEditTime(e.target.value)}
                            />
                          </div>
                        </div>

                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button
                            onClick={handleUpdateAppointment}
                            disabled={isUpdating}
                          >
                            {isUpdating && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Update Appointment
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  {currentUser.role === "STUDENT" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAppointment(appointment.id)}
                    >
                      <Trash2 size={14} className="mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ThesisAppointments;
