"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  LinearProgress,
  FormHelperText,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Image from "next/image";
import { signup } from "@/lib/api";
import { toast } from "react-toastify";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    companyName: "",
    address: "",
    city: "",
    zip: "",
    industry: "",
    currencySymbol: "",
  });

  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score += 30;
    if (/[A-Z]/.test(p)) score += 20;
    if (/[0-9]/.test(p)) score += 20;
    if (/[^A-Za-z0-9]/.test(p)) score += 30;
    return Math.min(score, 100);
  };

  const passwordStrength = getPasswordStrength();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max file size allowed: 5 MB");
      return;
    }
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      toast.error("Only PNG/JPG files allowed.");
      return;
    }

    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const validate = (): boolean => {
    const temp: Record<string, string> = {};

    if (!form.firstName.trim()) temp.firstName = "Enter your first name.";
    if (!form.lastName.trim()) temp.lastName = "Enter your last name.";
    if (!form.email.trim()) temp.email = "Enter a valid email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) temp.email = "Invalid email.";
    if (!form.password.trim()) temp.password = "Enter a password.";
    if (!form.companyName.trim()) temp.companyName = "Enter your company name.";
    if (!form.address.trim()) temp.address = "Enter company address.";
    if (!form.city.trim()) temp.city = "Enter city.";
    if (!/^\d{6}$/.test(form.zip)) temp.zip = "Zip must be 6 digits.";
    if (!form.currencySymbol.trim()) temp.currencySymbol = "Enter currency symbol.";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("FirstName", form.firstName);
    formData.append("LastName", form.lastName);
    formData.append("Email", form.email);
    formData.append("Password", form.password);
    formData.append("CompanyName", form.companyName);
    formData.append("Address", form.address);
    formData.append("City", form.city);
    formData.append("ZipCode", form.zip);
    formData.append("Industry", form.industry || "");
    formData.append("CurrencySymbol", form.currencySymbol);
    if (logo) formData.append("logo", logo);

    try {
      await signup(formData);
      toast.success("Account created successfully!");
      router.push("/login");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed. Please try again.";
      if (msg.includes("already exists")) {
        setErrors({ email: "Email already exists." });
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", pt: 6, pb: 8, bgcolor: "#fafafa" }}>
      <Typography variant="h4" fontWeight={300} textAlign="center" mb={1}>
        Create Your Account
      </Typography>
      <Typography variant="body1" color="text.secondary" textAlign="center" mb={4}>
        Set up your company and start invoicing in minutes.
      </Typography>

      <Paper elevation={1} sx={{ maxWidth: 900, mx: "auto", p: 4, borderRadius: 3, bgcolor: "#fff" }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" mb={2}>User Information</Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="First Name*" name="firstName" placeholder="Enter first name" value={form.firstName} onChange={handleChange} error={!!errors.firstName} helperText={errors.firstName} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Last Name*" name="lastName" placeholder="Enter last name" value={form.lastName} onChange={handleChange} error={!!errors.lastName} helperText={errors.lastName} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Email*" name="email" placeholder="Enter your email" value={form.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Password*"
                  name="password"
                  placeholder="Enter password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {form.password && (
                  <Box mt={1}>
                    <LinearProgress variant="determinate" value={passwordStrength} />
                    <FormHelperText sx={{ mt: 0.5 }}>
                      Password strength: {passwordStrength < 40 ? "Weak" : passwordStrength < 70 ? "Medium" : "Strong"}
                    </FormHelperText>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" mb={2}>Company Information</Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Company Name*" name="companyName" placeholder="Enter company name" value={form.companyName} onChange={handleChange} error={!!errors.companyName} helperText={errors.companyName} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button variant="outlined" fullWidth component="label">
                  Upload Company Logo
                  <input type="file" hidden onChange={handleLogoChange} />
                </Button>
                {logoPreview && (
                  <Box mt={2}>
                    <Image width={60} height={60} src={logoPreview} alt="Preview" style={{ borderRadius: 6, objectFit: "cover" }} />
                  </Box>
                )}
                <FormHelperText>Max 2–5 MB</FormHelperText>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Address*" name="address" placeholder="Enter company address" multiline minRows={3} value={form.address} onChange={handleChange} error={!!errors.address} helperText={errors.address} />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <TextField fullWidth label="City*" name="city" placeholder="Enter city" value={form.city} onChange={handleChange} error={!!errors.city} helperText={errors.city} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField fullWidth label="Zip Code*" name="zip" placeholder="6 digit zip code" value={form.zip} onChange={handleChange} error={!!errors.zip} helperText={errors.zip} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Industry" name="industry" placeholder="Industry type" value={form.industry} onChange={handleChange} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Currency Symbol*" name="currencySymbol" placeholder="$, ₹, €, AED" value={form.currencySymbol} onChange={handleChange} error={!!errors.currencySymbol} helperText={errors.currencySymbol} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Box textAlign="right" mt={4}>
          <Button type="button" variant="contained" size="large" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </Box>

        <Typography textAlign="center" mt={3}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#1976d2", textDecoration: "none", fontWeight: 500 }}>
            Login
          </a>
        </Typography>
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
  );
}