import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Car,
  CheckCircle2,
  KeyRound,
  LogOut,
  Mail,
  Phone,
  Save,
  Shield,
  User,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { vehicleApi } from "@/services/api";
import { signOut, useSession } from "@/utils/helpers";

/**
 * Owner Profile & Settings Page
 */
export function Profile() {
  const navigate = useNavigate();
  const session = useSession();
  const [vehicleCount, setVehicleCount] = useState(0);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    let isActive = true;

    vehicleApi.list()
      .then((response) => {
        if (!isActive) return;
        setVehicleCount((response.data || []).length);
      })
      .catch((error) => {
        if (isActive) setProfileError(error.message || "Unable to load profile details.");
      });

    return () => {
      isActive = false;
    };
  }, []);

  // Contact info
  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [phone, setPhone] = useState(session?.phone ?? "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Notifications preferences
  const [notifySms, setNotifySms] = useState(true);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordNotice, setPasswordNotice] = useState(null);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordNotice({ type: "error", msg: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordNotice({ type: "error", msg: "Passwords do not match." });
      return;
    }
    setPasswordNotice({ type: "success", msg: "Password updated successfully!" });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordNotice(null), 3000);
  };

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DashboardLayout role="owner">
      <div className="mx-auto max-w-4xl space-y-8">
        <PageHeader
          title="Account &amp; Profile"
          description="Manage your contact details, emergency notifications and account credentials."
        />

        {/* Profile Card Header */}
        <div className="surface-card p-6 flex flex-col sm:flex-row sm:items-center gap-6">
          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-primary font-display text-2xl font-bold text-primary-foreground shadow-md">
            {initials}
          </span>
          <div className="space-y-1">
            <h2 className="font-display text-xl font-bold">{name}</h2>
            <p className="text-sm text-muted-foreground">
              {email} · {phone}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <Car className="h-3.5 w-3.5 text-primary" /> {vehicleCount} Saved Vehicles
              </span>
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-success" /> Verified Driver Profile
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Contact Details */}
        {profileError && (
          <div className="surface-card p-4 text-sm text-destructive" role="alert">{profileError}</div>
        )}

        <section className="surface-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <User className="h-5 w-5 text-accent" />
            <h3 className="font-display text-lg font-bold">Personal Information</h3>
          </div>

          {savedSuccess && (
            <div className="rounded-xl bg-success/15 border border-success/30 p-3 text-xs text-success flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Profile details saved successfully.
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <Button type="submit" variant="accent">
              <Save className="h-4 w-4" /> Save Contact Details
            </Button>
          </form>
        </section>

        {/* Section 2: Notifications */}
        <section className="surface-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <Bell className="h-5 w-5 text-accent" />
            <h3 className="font-display text-lg font-bold">Emergency Notifications</h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-xl border border-border cursor-pointer hover:bg-secondary/40">
              <div>
                <p className="text-sm font-semibold">SMS Dispatch Alerts</p>
                <p className="text-xs text-muted-foreground">
                  Receive mechanic arrival alerts on mobile
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifySms}
                onChange={(e) => setNotifySms(e.target.checked)}
                className="rounded border-input text-primary h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-border cursor-pointer hover:bg-secondary/40">
              <div>
                <p className="text-sm font-semibold">WhatsApp Live GPS Link</p>
                <p className="text-xs text-muted-foreground">
                  Share tracking link with family in 1 tap
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifyWhatsapp}
                onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                className="rounded border-input text-primary h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-border cursor-pointer hover:bg-secondary/40">
              <div>
                <p className="text-sm font-semibold">Email Digital Invoices</p>
                <p className="text-xs text-muted-foreground">
                  Receive PDF tax receipts immediately
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                className="rounded border-input text-primary h-4 w-4"
              />
            </label>
          </div>
        </section>

        {/* Section 3: Security & Password */}
        <section className="surface-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <KeyRound className="h-5 w-5 text-accent" />
            <h3 className="font-display text-lg font-bold">Security &amp; Password</h3>
          </div>

          {passwordNotice && (
            <div
              className={`rounded-xl p-3 text-xs flex items-center gap-2 ${
                passwordNotice.type === "success"
                  ? "bg-success/15 border border-success/30 text-success"
                  : "bg-destructive/15 border border-destructive/30 text-destructive"
              }`}
            >
              <span>{passwordNotice.msg}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <Button type="submit" variant="default">
              Update Password
            </Button>
          </form>
        </section>

        {/* Section 4: Sign out */}
        <div className="flex justify-end">
          <Button variant="danger" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Sign Out of RoadGuard
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
export default Profile;
