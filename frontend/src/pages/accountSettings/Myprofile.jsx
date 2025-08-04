import { useEffect, useState } from "react";
import { profileService } from "../../services/profile";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { getProfileImage } from "../../services/getPicture";

export default function Myprofile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileService.getProfile();

      if (response.success) {
        setProfile(response.data);
      } else {
        toast.error("Failed to fetch profile");
      }
    } catch (error) {
      toast.error("An unexpected error occured");
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
    <Card>
      
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          <Avatar className="h-24 w-24">
            {profile.image ? (
              <AvatarImage
                src={getProfileImage(profile.image)}
                alt={`${profile.name}'s profile picture`}
              />
            ) : null}
            <AvatarFallback className="text-2xl">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
          
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{profile.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{profile.email}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Department</p>
          <p className="font-medium">{profile.department}</p>
        </div>

        {profile.about && (
          <div>
            <p className="text-sm text-muted-foreground">About</p>
            <p className="font-medium">{profile.about}</p>
          </div>
        )}

        {profile.researchInterest && (
          <div>
            <p className="text-sm text-muted-foreground">Research Interests</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.researchInterest
                .split(";")
                .filter((interest) => interest.trim())
                .map((interest, index) => (
                  <Badge key={index} variant="outline">
                    {interest.trim()}
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
