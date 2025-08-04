import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "STUDENT",
    department: "CSE",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    password: [],
    confirmPassword: "",
    general: "",
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const newErrors = [];
    if (password.length < 8) newErrors.push("Must be at least 8 characters");
    if (!/[A-Za-z]/.test(password)) newErrors.push("Must contain letters");
    if (!/\d/.test(password)) newErrors.push("Must contain numbers");
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "password") {
      const passwordErrors = validatePassword(value);
      setErrors(prev => ({
        ...prev,
        password: passwordErrors,
        confirmPassword:
          value !== formData.confirmPassword ? "Passwords don't match" : "",
      }));
    }

    if (name === "confirmPassword") {
      setErrors(prev => ({
        ...prev,
        confirmPassword:
          value !== formData.password ? "Passwords don't match" : "",
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ password: [], confirmPassword: "", general: "" });

    // Validate form

    if (errors.password.length > 0 || errors.confirmPassword) {
      return;
    }

    try {
      setLoading(true);
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department,
      });

      if (result.success) {
        navigate("/auth/signin");
      } else {
        setErrors(prev => ({ ...prev, general: result.message }));
      }
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        general: "An unexpected error occurred",
      }));
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch =
    formData.password === formData.confirmPassword &&
    formData.password.length > 0;
  const isPasswordValid = errors.password.length === 0 && formData.password.length > 0;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your information to register
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="text-sm font-medium text-destructive">
                {errors.general}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter full name"
                required
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label>You are a</Label>
              <Select
                value={formData.role}
                onValueChange={value => handleSelectChange("role", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="FACULTY">Faculty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Department</Label>
              <Select
                value={formData.department}
                onValueChange={value => handleSelectChange("department", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSE">Computer Science & Engineering</SelectItem>
                  <SelectItem value="MNS">Mathematics & Natural Sciences</SelectItem>
                  <SelectItem value="EEE">Electrical & Electronics Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              {formData.password.length > 0 && (
                <div className="text-sm">
                  {errors.password.length > 0 ? (
                    <ul className="text-destructive list-disc pl-5">
                      {errors.password.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-green-500">✓ Password meets requirements</span>
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
              {formData.confirmPassword.length > 0 && (
                <div className="text-sm">
                  {errors.confirmPassword ? (
                    <span className="text-destructive">{errors.confirmPassword}</span>
                  ) : (
                    passwordsMatch && (
                      <span className="text-green-500">✓ Passwords match</span>
                    )
                  )}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading || !isPasswordValid || !passwordsMatch }>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/auth/signin" className="underline hover:text-primary">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}