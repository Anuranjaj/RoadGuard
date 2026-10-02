import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Car, LifeBuoy, Wrench } from "lucide-react";
import { Button } from "@/components/Button";
import { homeFor, signIn } from "@/utils/helpers";
import { authApi } from "@/services/api";

/**
 * Public Registration Page for Owners and Mechanics
 */
export function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("owner");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (formData.name.trim().length < 3) {
      nextErrors.name = "Enter your full name.";
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    const cleanPhone = formData.phone.replace(/\s/g, "");
    if (!/^(\+91)?[6-9]\d{9}$/.test(cleanPhone)) {
      nextErrors.phone = "Enter a valid 10-digit Indian mobile number.";
    }
    if (formData.password.length < 8) {
      nextErrors.password = "Use at least 8 characters.";
    } else if (!/[A-Za-z]/.test(formData.password) || !/\d/.test(formData.password)) {
      nextErrors.password = "Include at least one letter and one number.";
    }
    if (formData.confirm !== formData.password) {
      nextErrors.confirm = "Passwords do not match.";
    }
    if (!formData.terms) {
      nextErrors.terms = "Please accept the terms to continue.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);

    try {
      const sessionRole = role === "mechanic" ? "PARTNER" : "OWNER";
      const response = await authApi.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: cleanPhone,
        password: formData.password,
        role: sessionRole,
      });

      const roleByAccountType = { OWNER: "owner", PARTNER: "mechanic" };
      const account = response?.data;
      const normalizedRole = roleByAccountType[account?.role];
      if (!response?.token || !account?.id || !normalizedRole) {
        throw new Error("The server returned an invalid account session.");
      }

      signIn({
        id: account.id,
        name: account.name,
        email: account.email,
        role: normalizedRole,
        token: response.token,
      });

      navigate(homeFor(normalizedRole));
    } catch (error) {
      setErrors({
        email: error.message || "Unable to create account right now.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary px-4 py-12">
      <div className="w-full max-w-xl">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <LifeBuoy className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-bold">RoadGuard</span>
        </Link>

        <div className="surface-card p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            It takes less than a minute. Service partners go through document verification after
            signup.
          </p>

          {/* Role selector */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2" role="group" aria-label="Account type">
            {[
              { value: "owner", label: "Vehicle Owner", hint: "Request roadside help", icon: Car },
              {
                value: "mechanic",
                label: "Service Partner",
                hint: "Mechanic or towing",
                icon: Wrench,
              },
            ].map((opt) => {
              const Icon = opt.icon;
              const isSelected = role === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  aria-pressed={isSelected}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{opt.label}</span>
                    <span className="block text-xs text-muted-foreground">{opt.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Full name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Arjun Menon"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="9847021145"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="password" block text-sm font-medium mb-1>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-destructive">{errors.password}</p>
                )}
              </div>
              <div>
                <label htmlFor="confirm" block text-sm font-medium mb-1>
                  Confirm password
                </label>
                <input
                  id="confirm"
                  type="password"
                  value={formData.confirm}
                  onChange={(e) => setFormData({ ...formData, confirm: e.target.value })}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.confirm && (
                  <p className="mt-1 text-xs text-destructive">{errors.confirm}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                className="mt-1 rounded border-input text-primary focus:ring-ring"
              />
              <label
                htmlFor="terms"
                className="text-sm font-normal text-muted-foreground cursor-pointer"
              >
                I agree to the RoadGuard terms of service and privacy policy.
              </label>
            </div>
            {errors.terms && <p className="text-xs text-destructive">{errors.terms}</p>}

            <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
export default Register;
