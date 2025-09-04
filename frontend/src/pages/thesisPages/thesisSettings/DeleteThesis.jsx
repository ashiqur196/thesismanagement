import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { thesisManagementService } from "../../../services/thesisManagement";
import { useThesis } from "../../../contexts/thesisContext";
import { Button } from "../../../components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../components/ui/alert-dialog";
import {
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

function DeleteThesis() {
  const { thesis } = useThesis();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleDelete = async () => {
    if (thesis.status !== "PENDING_SUPERVISOR") return;

    setIsDeleting(true);
    try {
      const result = await thesisManagementService.deleteThesis(thesis.id);

      if (result.success) {
        showMessage("Thesis deleted successfully! Redirecting...", "success");
        setTimeout(() => navigate("/"), 1500);
      } else {
        showMessage(result.message || "Failed to delete thesis", "error");
        setShowDialog(false);
      }
    } catch (error) {
      showMessage("An unexpected error occurred", "error");
      setShowDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (thesis.status !== "PENDING_SUPERVISOR") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 max-w-md mx-auto mt-6">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-amber-800">Deletion Not Allowed</h3>
          <p className="text-amber-700 text-sm mt-1">
            Only theses with status "PENDING_SUPERVISOR" can be deleted. Current status:{" "}
            <span className="font-medium">{thesis.status}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-6">
      {/* Status Message */}
      {message.text && (
        <div
          className={`p-3 rounded-lg mb-4 flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="bg-white border border-red-100 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto mb-4">
          <Trash2 className="h-6 w-6 text-red-600" />
        </div>

        <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">
          Delete Thesis
        </h2>

        <p className="text-gray-600 text-center text-sm mb-6">
          Are you sure you want to delete this thesis? This action cannot be
          undone.
        </p>

        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="w-full flex items-center justify-center gap-2 py-2.5"
            >
              <Trash2 className="h-4 w-4" />
              Delete Thesis
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription className="pt-2">
                This action cannot be undone. This will permanently delete the
                thesis titled{" "}
                <span className="font-medium">"{thesis.title}"</span> and remove
                all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-2 sm:justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600 gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default DeleteThesis;
