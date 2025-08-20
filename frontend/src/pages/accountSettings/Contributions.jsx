import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { profileService } from '../../services/profile';
import { useAuth } from "../../contexts/authContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, Plus } from 'lucide-react';

export default function Contributions() {
  const { currentUser } = useAuth();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contributionToDelete, setContributionToDelete] = useState(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    url: ''
  });

  // Fetch contributions
  const fetchContributions = async () => {
    try {
      setLoading(true);
      const response = await profileService.getContributions(currentUser.id);
      if (response.success) {
        setContributions(response.data);
      } else {
        toast.error(response.message || "Failed to fetch contributions");
      }
    } catch (error) {
      toast.error("An error occurred while fetching contributions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Start editing a contribution (opens dialog)
  const startEditing = (contribution) => {
    setEditingId(contribution.id);
    setFormData({
      title: contribution.title,
      subtitle: contribution.subtitle,
      description: contribution.description,
      url: contribution.url || ''
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      url: ''
    });
  };

  // Submit form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let response;
      if (editingId) {
        response = await profileService.updateContribution({
          ...formData,
          contributionId: editingId
        });
      } else {
        response = await profileService.addContribution(formData);
      }

      if (response.success) {
        toast.success(`Contribution ${editingId ? 'updated' : 'added'} successfully`);
        fetchContributions();
        cancelEditing();
        setIsAddFormOpen(false);
      } else {
        toast.error(response.message || `Failed to ${editingId ? 'update' : 'add'} contribution`);
      }
    } catch (error) {
      toast.error("An error occurred while saving the contribution");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (id) => {
    setContributionToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Delete a contribution
  const handleDelete = async () => {
    try {
      const response = await profileService.deleteContribution(contributionToDelete);
      if (response.success) {
        toast.success("Contribution deleted successfully");
        fetchContributions();
      } else {
        toast.error(response.message || "Failed to delete contribution");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the contribution");
    } finally {
      setDeleteDialogOpen(false);
      setContributionToDelete(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading contributions...</div>;
  }

  return (
    <div className="space-y-6 w-full max-w-3xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Contributions</h2>
        <Button
          onClick={() => setIsAddFormOpen(!isAddFormOpen)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Contribution
        </Button>
      </div>

      {/* Add Contribution Collapsible Form */}
      <Collapsible open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
        <CollapsibleContent>
          <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title*</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description*</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                name="url"
                type="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  cancelEditing();
                  setIsAddFormOpen(false);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Saving..."
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Contribution
                  </>
                )}
              </Button>
            </div>
          </form>
        </CollapsibleContent>
      </Collapsible>

      {/* Contributions List */}
      {contributions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No contributions yet. Add your first one above!
        </div>
      ) : (
        <div className="space-y-4">
          {contributions.map((contribution) => (
            <div key={contribution.id} className="border rounded-lg p-6 relative">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{contribution.title}</h3>
                    {contribution.subtitle && (
                      <p className="text-sm text-muted-foreground">
                        {contribution.subtitle}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditing(contribution)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(contribution.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm">{contribution.description}</p>

                {contribution.url && (
                  <div>
                    <a
                      href={contribution.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View Resource
                    </a>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Created: {new Date(contribution.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Contribution Dialog */}
      <Dialog open={!!editingId} onOpenChange={(open) => !open && cancelEditing()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contribution</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title*</Label>
                <Input
                  id="edit-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-subtitle">Subtitle</Label>
                <Input
                  id="edit-subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description*</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-url">URL</Label>
              <Input
                id="edit-url"
                name="url"
                type="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={cancelEditing}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Updating..."
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Update Contribution
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this contribution.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={"cursor-pointer"}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}