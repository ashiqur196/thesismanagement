import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircleIcon } from "lucide-react";
import { thesisManagementService } from "../../services/thesisManagement";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function CreateThesis() {
  return (
    <div className="w-full max-w-3xl">
      <Tabs defaultValue="create">
        <TabsList>
          <TabsTrigger value="create">Create Thesis</TabsTrigger>
          <TabsTrigger value="join">Join Thesis</TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <Create />
        </TabsContent>
        <TabsContent value="join">
          <Join />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Create() {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (!title) {
      setError("Please provide a thesis title");
      setLoading(false);
      return;
    }

    try {
      const response = await thesisManagementService.createThesis({ title });
      
      if (response.success) {
        toast.success("Thesis created successfully");
        setTitle("");
      } else {
        setError(response.message || "Failed to create thesis");
        toast.error(response.message || "Failed to create thesis");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Create Thesis</CardTitle>
          <CardDescription>
            Thesis title can be changed later on thesis settings page after
            creation.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 mt-3">
          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="title">Thesis title</Label>
            <Input
              id="title"
              placeholder="Enter thesis title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter className="mt-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating Thesis..." : "Create thesis"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function Join() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (!code || !password) {
      setError("Both fields are required");
      setLoading(false);
      return;
    }

    try {
      const response = await thesisManagementService.joinThesis({ 
        code, 
        password 
      });
      
      if (response.success) {
        toast.success("Successfully joined thesis");
        setCode("");
        setPassword("");
      } else {
        setError(response.message || "Failed to join thesis");
        toast.error(response.message || "Failed to join thesis");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Join thesis</CardTitle>
          <CardDescription>
            You can ask your thesis partner to provide an existing thesis code and
            password to join them.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 mt-3">
          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="th-code">Thesis Code</Label>
            <Input
              id="th-code"
              placeholder="Enter thesis code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError("");
              }}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="th-password">Password</Label>
            <Input
              id="th-password"
              type="password"
              placeholder="Enter thesis password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter className="mt-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Joining..." : "Join thesis"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default CreateThesis;