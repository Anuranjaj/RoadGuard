import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Menu, Search, User, LogOut, ExternalLink } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/Button";
import { useSession, signOut } from "@/utils/helpers";

/**
 * Standard Dashboard Layout with Sidebar and Top Navigation
 */
export function DashboardLayout({ role = "owner", children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const session = useSession();
  const navigate = useNavigate();

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const defaultNames = {
    owner: "Owner",
    mechanic: "Service Partner",
    admin: "Administrator",
  };

  const name = session?.name || defaultNames[role] || "User";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = () => {
    signOut();
    navigate("/login");
  };

  const profileLinks = {
    owner: "/owner/profile",
    mechanic: "/mechanic/profile",
    admin: "/admin",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-md border border-border lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Global Search Bar */}
            <div className="relative hidden max-w-sm flex-1 md:block">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search requests, vehicles, jobs..."
                className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Right side Header actions */}
            <div className="ml-auto flex items-center gap-2">
              {role === "owner" && (
                <Link to="/owner/request-service" className="hidden sm:inline-block">
                  <Button variant="accent">Request Assistance</Button>
                </Link>
              )}

              {/* Notification icon */}
              <button
                type="button"
                className="relative grid h-10 w-10 place-items-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Notifications"
                onClick={() => {}}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-destructive" />
              </button>

              {/* User Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 transition-colors hover:bg-secondary cursor-pointer"
                  aria-expanded={userMenuOpen}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {initials}
                  </span>
                  <span className="hidden text-sm font-medium sm:block max-w-[120px] truncate">
                    {name}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="surface-card absolute right-0 mt-2 w-56 p-1.5 shadow-[var(--shadow-float)] z-50">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs font-semibold capitalize text-accent-foreground">
                        {role === "mechanic" ? "Service Partner" : role} Account
                      </p>
                      <p className="text-sm font-bold truncate text-foreground">{name}</p>
                    </div>

                    <Link
                      to={profileLinks[role] || "/owner/profile"}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary"
                    >
                      <User className="h-4 w-4 text-muted-foreground" /> Profile &amp; Settings
                    </Link>

                    <Link
                      to="/"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary"
                    >
                      <ExternalLink className="h-4 w-4 text-muted-foreground" /> Back to Website
                    </Link>

                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 cursor-pointer text-left"
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Page Content */}
        <main className="flex-1 mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
