import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Car,
  CheckCircle2,
  FileText,
  History,
  Inbox,
  LifeBuoy,
  LogOut,
  MapPin,
  Radio,
  ShieldAlert,
  BarChart3,
  Users,
  Wallet,
  Wrench,
  X,
  User,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/Button";
import { signOut } from "@/utils/helpers";

const roleNavigation = {
  owner: [
    { to: "/owner", label: "Dashboard", icon: Car, exact: true },
    { to: "/owner/vehicles", label: "My Vehicles", icon: Car },
    { to: "/owner/request-service", label: "Request Service", icon: AlertTriangle },
    { to: "/owner/tracking", label: "Live Tracking", icon: MapPin },
    { to: "/owner/history", label: "Service History", icon: History },
    { to: "/owner/profile", label: "Profile & Settings", icon: User },
  ],
  mechanic: [
    { to: "/mechanic", label: "Dashboard", icon: Wrench, exact: true },
    { to: "/mechanic/requests", label: "Incoming Requests", icon: Inbox },
    { to: "/mechanic/active-job", label: "Active Job Console", icon: Radio },
    { to: "/mechanic/history", label: "Job History", icon: History },
    { to: "/mechanic/earnings", label: "Earnings & Payouts", icon: Wallet },
    { to: "/mechanic/profile", label: "Garage Profile", icon: User },
  ],
  admin: [
    { to: "/admin", label: "Admin Dashboard", icon: BarChart3, exact: true },
    { to: "/admin/users", label: "Vehicle Owners", icon: Users },
    { to: "/admin/partners", label: "Partner Verifications", icon: Wrench },
    { to: "/admin/requests", label: "Service Requests", icon: Radio },
    { to: "/admin/complaints", label: "Disputes & Complaints", icon: ShieldAlert },
    { to: "/admin/reports", label: "Analytics & Reports", icon: BarChart3 },
  ],
};

const roleTitles = {
  owner: "Vehicle Owner",
  mechanic: "Service Partner",
  admin: "Administrator",
};

/**
 * Reusable Sidebar for authenticated dashboards (Owner, Mechanic, Admin)
 */
export function Sidebar({ role = "owner", isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const items = roleNavigation[role] || roleNavigation.owner;

  const handleSignOut = () => {
    signOut();
    navigate("/login");
  };

  const content = (
    <div className="flex h-full flex-col bg-sidebar pb-4 pt-5 text-sidebar-foreground">
      {/* Brand logo & close on mobile */}
      <div className="flex items-center justify-between px-5 pb-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <LifeBuoy className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-bold">RoadGuard</span>
        </Link>
        {onClose && (
          <button
            type="button"
            className="text-sidebar-foreground/70 lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Role tag */}
      <p className="px-6 pb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/45">
        {roleTitles[role] || roleTitles.owner}
      </p>

      {/* Nav List */}
      <nav className="grid gap-1 px-3" aria-label="Sidebar">
        {items.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                  : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Emergency Request Banner (only for owner) */}
      {role === "owner" && (
        <div className="mt-6 px-5">
          <div className="rounded-xl bg-sidebar-accent p-4">
            <p className="text-sm font-semibold text-sidebar-accent-foreground">
              Stuck on the road?
            </p>
            <p className="mt-1 text-xs text-sidebar-foreground/70">
              Verified help reaches you in under 15 minutes.
            </p>
            <Link to="/owner/request-service" onClick={onClose}>
              <Button variant="accent" className="mt-3 w-full">
                Request Assistance
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Sign Out Action at bottom */}
      <div className="mt-auto px-5 pt-6">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5" aria-hidden="true" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Aside */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border lg:block">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/50 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-72 shadow-[var(--shadow-float)]">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
