import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LifeBuoy, ShieldCheck } from "lucide-react";
import { Button } from "@/components/Button";
import { homeFor, signIn } from "@/utils/helpers";
import { authApi } from "@/services/api";

/**
 * Clean and responsive Login Page for real account access.
 */
export function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};

    const trimmed = identifier.trim();
    const isEmail = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(trimmed);
    const isPhone = /^(\+91[\s-]?)?[6-9]\d{9}$/.test(trimmed.replace(/\s/g, ""));

    if (!trimmed) {
      nextErrors.identifier = "Enter your email address or phone number.";
    } else if (!isEmail && !isPhone) {
      nextErrors.identifier = "Enter a valid email address or 10-digit phone number.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);

    try {
      const response = await authApi.login({
        identifier: trimmed,
        password,
      });

      const roleByAccountType = { OWNER: "owner", PARTNER: "mechanic", ADMIN: "admin" };
      const account = response?.data;
      const sessionRole = roleByAccountType[account?.role];
      if (!response?.token || !account?.id || !sessionRole) {
        throw new Error("The server returned an invalid account session.");
      }

      signIn({
        id: account.id,
        name: account.name,
        email: account.email,
        role: sessionRole,
        token: response.token,
      }, rememberMe);

      navigate(homeFor(sessionRole));
    } catch (error) {
      setErrors({
        identifier: error.message || "Unable to sign in. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Left Branding Side (Desktop only) */}
      <section className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-foreground">
            <LifeBuoy className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-bold">RoadGuard</span>
        </Link>

        <div className="max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Help is minutes away, wherever the road stops you.
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            18,400+ drivers and 1,200+ verified mechanics and towing partners across Kerala trust
            RoadGuard every day.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm text-primary-foreground/80">
            <ShieldCheck className="h-5 w-5 text-success" aria-hidden="true" />
            Verified partners · Transparent pricing · Live tracking
          </div>
        </div>

        <p className="text-xs text-primary-foreground/60">© 2026 RoadGuard Mobility Pvt Ltd</p>
      </section>

      {/* Right Sign-in Form Side */}
      <section className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <LifeBuoy className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-bold">RoadGuard</span>
          </Link>

          <h1 className="font-display text-3xl font-bold tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with your RoadGuard account to continue.
          </p>

          {toastMessage && (
            <div className="mt-4 rounded-lg bg-info/15 border border-info/30 p-3 text-xs text-info">
              {toastMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="identifier" className="block text-sm font-medium">
                Email or phone
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.identifier && <p className="text-xs text-destructive">{errors.identifier}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  onClick={() => setToastMessage("Password reset is not available yet.")}
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-input text-primary focus:ring-ring"
              />
              <label
                htmlFor="remember"
                className="text-sm font-normal text-muted-foreground cursor-pointer"
              >
                Remember me on this device
              </label>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to RoadGuard?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
export default Login;
