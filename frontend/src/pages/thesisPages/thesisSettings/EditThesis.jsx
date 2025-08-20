import React, { useState } from "react";
import { useThesis } from "../../../contexts/thesisContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";
import { X, Plus, Save, ArrowLeft, Copy, Key, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

function EditThesis() {
  const { thesis, loading, editThesis, refreshThesis, changePassword } = useThesis();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: thesis?.title || "",
    description: thesis?.description || "",
  });
  
  const [tagInput, setTagInput] = useState("");
  const [researchTags, setResearchTags] = useState(
    thesis?.researchTags ? thesis.researchTags.split(';').filter(tag => tag.trim()) : []
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!thesis) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No thesis data available</p>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !researchTags.includes(trimmedTag)) {
      setResearchTags(prev => [...prev, trimmedTag]);
      setTagInput("");
    } else if (researchTags.includes(trimmedTag)) {
      toast.error("Tag already exists");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setResearchTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleChangePassword = async () => {
    setIsChangingPassword(true);
    try {
      const result = await changePassword({});
      if (result.success) {
        toast.success("Password changed successfully");
      } else {
        toast.error(result.message || "Failed to change password");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dataToUpdate = {
        title: formData.title,
        description: formData.description,
        researchTags: researchTags.join(';')
      };

      const result = await editThesis(dataToUpdate);
      
      if (result.success) {
        toast.success("Thesis updated successfully");

      } else {
        toast.error(result.message || "Failed to update thesis");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Edit Thesis</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Thesis Information Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Thesis Information</CardTitle>
            <CardDescription>
              Update your thesis details and research focus areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Thesis Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter thesis title"
                  required
                  maxLength={200}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.title.length}/200 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your research project"
                  rows={4}
                  maxLength={2000}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.description.length}/2000 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="researchTags">Research Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="researchTags"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter a research tag"
                    maxLength={50}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                    variant="secondary"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Press Enter or click Add to include a tag
                </p>
                
                {researchTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {researchTags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="flex items-center gap-1 px-3 py-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.title.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Thesis Access Information */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Thesis Access</CardTitle>
            <CardDescription>
              Manage access to your thesis project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Thesis Code
              </Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <code className="font-mono text-sm flex-1">
                  {thesis.Code}
                </code>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(thesis.Code)}
                  className="h-8 w-8"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this code with collaborators to join your thesis
              </p>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Join Password
              </Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <span className="font-mono text-sm flex-1">
                  {showPassword ? thesis.joinPassword : '•'.repeat(thesis.joinPassword.length)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="h-8 w-8"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(thesis.joinPassword)}
                  className="h-8 w-8"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Password required to join this thesis
              </p>
            </div>

            <div className="pt-4">
              <Button
                type="button"
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                variant="outline"
                className="w-full"
              >
                {isChangingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Generate New Password
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EditThesis;