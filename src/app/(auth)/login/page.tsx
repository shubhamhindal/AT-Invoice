"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { login } from "@/lib/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const temp: Record<string, string> = {};

    if (!form.email.trim()) temp.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) temp.email = "Invalid email.";

    if (!form.password.trim()) temp.password = "Please enter your password.";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, remember: e.target.checked });
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await login(form.email.trim(), form.password);
      const token = response.token;

      if (!token) {
        toast.error("Login failed. Please try again.");
        return;
      }
      

      if (form.remember) {
        sessionStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      document.cookie = `auth_token=${token}; path=/; max-age=${form.remember ? 604800 : 3600}; SameSite=Lax`;

      toast.success("Login successful!");
      router.replace("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid email or password";
      console.log(message, "-----");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !form.email.trim() || !form.password || loading;

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#f5f7fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ maxWidth: 420, width: "100%" }}>
          <Typography
            variant="h4"
            fontWeight={500}
            textAlign="center"
            color="#2d3748"
            mb={1}
          >
            Welcome Back
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            mb={5}
          >
            Log in to your account.
          </Typography>

          <Paper
            elevation={8}
            sx={{
              overflow: "hidden",
              boxShadow: "0 6px 6px rgba(0,0,0,0.1)",
            }}
          >
            <Box p={5}>
              <TextField
                fullWidth
                label="Email Address*"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                onBlur={validate}
                error={!!errors.email}
                helperText={errors.email}
                variant="outlined"
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    height: 56,
                    backgroundColor: "#f8fafc",
                  },
                  "& .MuiInputLabel-root": {
                    fontWeight: 500,
                    color: "#4a5568",
                  },
                }}
              />

              <TextField
                fullWidth
                label="Password*"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                onBlur={validate}
                error={!!errors.password}
                helperText={errors.password}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    height: 56,
                    backgroundColor: "#f8fafc",
                  },
                  "& .MuiInputLabel-root": {
                    fontWeight: 500,
                    color: "#4a5568",
                  },
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.remember}
                    onChange={handleCheckbox}
                    color="primary"
                    sx={{ py: 0 }}
                  />
                }
                label="Remember me"
                sx={{ mb: 3, "& .MuiFormControlLabel-label": { fontSize: "0.95rem" } }}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={isDisabled}
                sx={{
                  py: 1.8,
                  textTransform: "none",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  backgroundColor: "#3182ce",
                  "&:hover": {
                    backgroundColor: "#2c74b3",
                  },
                  "&:disabled": {
                    backgroundColor: "#a0aec0",
                  },
                }}
              >
                {loading ? <CircularProgress size={28} color="inherit" /> : "Login"}
              </Button>

              <Typography textAlign="center" mt={4} color="text.secondary">
                Don&apos;t have an account?{" "}
                <Button
                  onClick={() => router.push("/signup")}
                  variant="text"
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    color: "#3182ce",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Create account
                </Button>
              </Typography>
            </Box>
          </Paper>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            mt={6}
            fontSize="0.875rem"
          >
            © 2025 InvoiceApp. All rights reserved.
          </Typography>
        </Box>
      </Box>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}