import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { profileService } from "../../services/profile";
import { getProfileImage } from "../../services/getPicture";
import { X } from "lucide-react";

// UI Components
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import { Separator } from "../../components/ui/separator";

const DEPARTMENTS = [
  { value: "CSE", label: "Computer Science & Engineering" },
  { value: "MNS", label: "Mathematical & Natural Sciences" },
  { value: "EEE", label: "Electrical & Electronics Engineering" },
];

export default function EditProfile() {
  // Refs
  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const aboutInputRef = useRef(null);
  const currentPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // State
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [researchInterests, setResearchInterests] = useState([]);
  const [newInterest, setNewInterest] = useState("");
  const [department, setDepartment] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    department: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !researchInterests.includes(newInterest.trim())) {
      setResearchInterests([...researchInterests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (index) => {
    setResearchInterests(researchInterests.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const validateProfileForm = () => {
    const newErrors = {};
    if (!nameInputRef.current.value) newErrors.name = "Name is required";
    if (!department) newErrors.department = "Department is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    if (!currentPasswordRef.current.value) {
      newErrors.currentPassword = "Current password is required";
    }
    if (!newPasswordRef.current.value) {
      newErrors.newPassword = "New password is required";
    } else if (newPasswordRef.current.value.length < 8) {
      newErrors.newPassword = "Must be at least 8 characters";
    } else if (!/[a-zA-Z]/.test(newPasswordRef.current.value)) {
      newErrors.newPassword = "Must contain at least one letter";
    } else if (!/[0-9]/.test(newPasswordRef.current.value)) {
      newErrors.newPassword = "Must contain at least one number";
    }
    if (newPasswordRef.current.value !== confirmPasswordRef.current.value) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", nameInputRef.current.value);
      formData.append("about", aboutInputRef.current.value);
      formData.append("department", department);
      formData.append("researchInterest", researchInterests.join(";"));

      if (fileInputRef.current.files[0]) {
        formData.append("image", fileInputRef.current.files[0]);
      }

      const response = await profileService.updateProfile(formData);
      if (response.success) {
        toast.success("Profile updated successfully");
        fetchProfile(); // Refresh profile data
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred while updating your profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setIsSubmitting(true);
    try {
      const response = await profileService.updatePassword({
        currentPassword: currentPasswordRef.current.value,
        newPassword: newPasswordRef.current.value,
      });
      if (response.success) {
        toast.success("Password updated successfully");
        // Clear password fields
        currentPasswordRef.current.value = "";
        newPasswordRef.current.value = "";
        confirmPasswordRef.current.value = "";
      } else {
        toast.error(response.message || "Failed to update password");
      }
    } catch (error) {
      toast.error("An error occurred while updating your password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .toUpperCase()
      : "";
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileService.getProfile();
      if (response.success) {
        setProfile(response.data);
        setResearchInterests(
          response.data.researchInterest
            ? response.data.researchInterest.split(";").filter((i) => i.trim())
            : []
        );
        setDepartment(response.data.department || "");
      } else {
        toast.error("Failed to fetch profile");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-pulse">Loading profile...</div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Failed to load profile data</p>
          <Button variant="outline" className="mt-4" onClick={fetchProfile}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mx-auto w-full max-w-3xl">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your personal information and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-24 w-24">
                    {selectedImage || profile.image ? (
                      <AvatarImage
                        src={selectedImage || getProfileImage(profile.image)}
                        alt={`${profile.name}'s profile`}
                      />
                    ) : null}
                    <AvatarFallback className="text-2xl">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                    <Button
                      variant="ghost"
                      className="text-white hover:text-white"
                      onClick={triggerFileInput}
                    >
                      Change
                    </Button>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={triggerFileInput}
                  className="w-full max-w-xs"
                >
                  Upload New Photo
                </Button>
              </div>

              <form onSubmit={onProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      ref={nameInputRef}
                      defaultValue={profile.name || ""}
                    />
                    {errors.name && (
                      <p className="text-sm font-medium text-destructive">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept.value} value={dept.value}>
                            {dept.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.department && (
                      <p className="text-sm font-medium text-destructive">
                        {errors.department}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="about">About</Label>
                  <Textarea
                    id="about"
                    ref={aboutInputRef}
                    defaultValue={profile.about || ""}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Research Interests</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add research interest"
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddInterest()
                      }
                    />
                    <Button
                      type="button"
                      onClick={handleAddInterest}
                      disabled={!newInterest.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  {researchInterests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {researchInterests.map((interest, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="px-3 py-1"
                        >
                          {interest}
                          <button
                            type="button"
                            onClick={() => handleRemoveInterest(index)}
                            className="ml-2 rounded-full hover:bg-accent"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" asChild>
                    <Link to="/account/profile">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Ensure your account is secure with a strong password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onPasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    ref={currentPasswordRef}
                  />
                  {errors.currentPassword && (
                    <p className="text-sm font-medium text-destructive">
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    ref={newPasswordRef}
                  />
                  {errors.newPassword ? (
                    <p className="text-sm font-medium text-destructive">
                      {errors.newPassword}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters with letters and numbers
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    ref={confirmPasswordRef}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm font-medium text-destructive">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" asChild>
                    <Link to="/account/profile">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
