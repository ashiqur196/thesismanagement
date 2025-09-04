import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/authContext';
import { useThesis } from '../../../contexts/thesisContext';
import { thesisManagementService } from '../../../services/thesisManagement';
import { getProfileImage } from '../../../services/getPicture';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Loader2, Trash2, User, GraduationCap, Crown, UserCog, Plus } from 'lucide-react';

const ThesisCollaborators = () => {
  const { currentUser } = useAuth();
  const { thesis } = useThesis();
  const thesisId = thesis.id;
  const [members, setMembers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removeDialog, setRemoveDialog] = useState({
    open: false,
    member: null,
    isStudent: false
  });
  const [addMemberDialog, setAddMemberDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    fetchMembers();
  }, [thesisId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await thesisManagementService.getThesisMembers(thesisId);
      
      if (response.success) {
        setMembers(response.data);
      } else {
        setError(response.message || 'Failed to fetch members');
      }
    } catch (err) {
      setError('Failed to load collaborators');
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveClick = (member, isStudent = true) => {
    setRemoveDialog({
      open: true,
      member,
      isStudent
    });
  };

  const handleRemoveConfirm = async () => {
    try {
      const { member, isStudent } = removeDialog;
      
      const response = await thesisManagementService.removeThesisMember({
        email: member.email,
        thesisId: thesisId
      });

      if (response.success) {
        // Refresh the members list
        await fetchMembers();
      } else {
        setError(response.message || 'Failed to remove member');
      }
    } catch (err) {
      setError('Failed to remove member');
      console.error('Error removing member:', err);
    } finally {
      setRemoveDialog({ open: false, member: null, isStudent: false });
    }
  };

  const handleAddMember = async () => {
    if (!email.trim()) {
      setAddError('Please enter an email address');
      return;
    }

    try {
      setAdding(true);
      setAddError('');
      
      const response = await thesisManagementService.addThesisMember(thesisId, {
        email: email.trim()
      });

      if (response.success) {
        setAddMemberDialog(false);
        setEmail('');
        // Refresh the members list
        await fetchMembers();
      } else {
        setAddError(response.message || 'Failed to add member');
      }
    } catch (err) {
      setAddError('Failed to add member');
      console.error('Error adding member:', err);
    } finally {
      setAdding(false);
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Check if current user is the creator of the thesis
  const isCurrentUserCreator = members?.students?.some(
    student => student.creator && student.userId === currentUser?.id
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading collaborators...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-destructive text-center">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 container mx-auto">
      {/* Add Member Button (only for creator) */}
      {isCurrentUserCreator && (
        <div className="flex justify-end">
          <Button onClick={() => setAddMemberDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      )}

      {/* Supervisor Section */}
      {members?.supervisor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Supervisor
            </CardTitle>
            <CardDescription>
              Faculty member supervising this thesis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={getProfileImage(members.supervisor.image)} />
                  <AvatarFallback>
                    {getInitials(members.supervisor.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{members.supervisor.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {members.supervisor.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Faculty
                </Badge>
                {isCurrentUserCreator && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveClick(members.supervisor, false)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Student Members
          </CardTitle>
          <CardDescription>
            {members?.students?.length || 0} student(s) working on this thesis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {members?.students?.map((student) => (
            <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={getProfileImage(student.image)} />
                  <AvatarFallback>
                    {getInitials(student.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold flex items-center gap-2">
                    {student.name}
                    {student.userId === currentUser?.id && (
                      <Badge variant="outline" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {student.email}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Joined: {new Date(student.joinedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end gap-1">
                  {student.creator && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Creator
                    </Badge>
                  )}
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    Student
                  </Badge>
                </div>
                {isCurrentUserCreator && !student.creator && student.userId !== currentUser?.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveClick(student, true)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {(!members?.students || members.students.length === 0) && (
            <div className="text-center text-muted-foreground py-8">
              No student members yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={removeDialog.open} onOpenChange={(open) => setRemoveDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Collaborator</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {removeDialog.member?.name} from this thesis? 
              {removeDialog.isStudent ? ' This student will lose access to all thesis materials.' : ' The supervisor role will be removed.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialog} onOpenChange={setAddMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Student Member</DialogTitle>
            <DialogDescription>
              Enter the email address of the student you want to add to this thesis.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={adding}
              />
              {addError && (
                <div className="text-sm text-destructive">{addError}</div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddMemberDialog(false)}
              disabled={adding}
            >
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={adding}>
              {adding && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ThesisCollaborators;