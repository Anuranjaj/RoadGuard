import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import { Logo } from "@/components/Navbar";

/**
 * Public website footer with brand details, links, and contact information
 */
export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        {/* Brand Column */}
        <div className="space-y-4">
          <Logo light />
          <p className="max-w-xs text-sm text-primary-foreground/70">
            Verified mechanics and towing partners, dispatched to your location 24x7 across India.
          </p>
        </div>

        {/* Services Links */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider">Services</h3>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/70">
            <li>Breakdown Repair</li>
            <li>Towing Assistance</li>
            <li>Battery Jump-Start</li>
            <li>Flat Tire Repair</li>
            <li>Fuel Delivery</li>
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider">Company</h3>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/70">
            <li>
              <Link to="/about" className="hover:text-primary-foreground transition-colors">
                About us
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-primary-foreground transition-colors">
                Become a partner
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-primary-foreground transition-colors">
                Our Services
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary-foreground transition-colors">
                Contact &amp; Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider">Reach us</h3>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/70">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" aria-hidden="true" /> 1800 202 4455
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" aria-hidden="true" /> help@roadguard.in
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> Infopark Phase 1,
              Kochi, Kerala
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15 px-4 py-5 text-center text-xs text-primary-foreground/60">
        © 2026 RoadGuard Assistance Pvt Ltd. All rights reserved.
      </div>
    </footer>
  );
}
