import React from "react";
import { Wrench, Truck, BatteryCharging, Disc3, Fuel } from "lucide-react";
import { cn } from "@/utils/helpers";

const icons = {
  breakdown: Wrench,
  towing: Truck,
  battery: BatteryCharging,
  tyre: Disc3,
  fuel: Fuel,
};

/**
 * Display icon for a given service category
 */
export function ServiceIcon({ service, className = "" }) {
  const IconComponent = icons[service] || Wrench;
  return <IconComponent className={cn("h-5 w-5", className)} aria-hidden="true" />;
}
