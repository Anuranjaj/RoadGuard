import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LifeBuoy, Menu, X } from "lucide-react";
import { Button } from "@/components/Button";
import { useSession, homeFor, isAuthenticatedSession } from "@/utils/helpers";

export const navLinks = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Logo({ light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="RoadGuard home">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-foreground">
        <LifeBuoy className="h-5 w-5" aria-hidden="true" />
      </span>
      <span
        className={`font-display text-lg font-bold tracking-tight ${
          light ? "text-primary-foreground" : "text-foreground"
        }`}
      >
        RoadGuard
      </span>
    </Link>
  );
}

/**
 * Public navigation bar with responsive drawer and active link styling
 */
export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const session = useSession();

  const handleGetAssistance = () => {
    if (isAuthenticatedSession(session)) {
      navigate("/owner/request-service");
      return;
    }
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden items-center gap-2 lg:flex">
          {session ? (
            <Link to={homeFor(session.role)}>
              <Button variant="default">Dashboard ({session.name.split(" ")[0]})</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Button variant="accent" onClick={handleGetAssistance}>Get Assistance</Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-md border border-border lg:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5 text-foreground" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 pt-2 lg:hidden">
          <nav className="grid gap-1" aria-label="Mobile">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-md px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? "bg-secondary text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-3 grid gap-2">
            {session ? (
              <Link to={homeFor(session.role)} onClick={() => setIsOpen(false)}>
                <Button variant="default" className="w-full">
                  Dashboard ({session.name})
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Button
                  variant="accent"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setIsOpen(false);
                    handleGetAssistance();
                  }}
                >
                  Get Assistance
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
