import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ServiceCard } from "@/components/ServiceCard";
import { SectionTitle } from "@/components/SectionTitle";
import { Button } from "@/components/Button";
import { serviceCategories } from "@/data/mockData";
import { inr, isAuthenticatedSession, useSession } from "@/utils/helpers";

/**
 * Public Services & Pricing Page for RoadGuard
 */
export function Services() {
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
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Banner */}
        <section className="bg-primary py-14 text-primary-foreground lg:py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-3xl font-bold sm:text-5xl">Roadside services</h1>
            <p className="mt-4 max-w-2xl text-primary-foreground/75">
              Whatever stopped your vehicle, a verified RoadGuard partner can handle it on the spot.
              Prices below are starting rates — you always see the final estimate before confirming.
            </p>
          </div>
        </section>

        {/* Service Cards Grid */}
        <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {serviceCategories.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </section>

        {/* Pricing Breakdown Table */}
        <section className="bg-secondary/60 py-14">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow="Pricing"
              title="Simple, upfront rates"
              description="Final price depends on distance, parts used and time of day. No hidden charges."
            />
            <div className="surface-card mt-8 overflow-hidden">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">
                  Starting price and arrival time for each service
                </caption>
                <thead className="bg-secondary text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-3">
                      Service
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Starting price
                    </th>
                    <th scope="col" className="hidden px-5 py-3 sm:table-cell">
                      Typical arrival
                    </th>
                    <th scope="col" className="hidden px-5 py-3 md:table-cell">
                      Included
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {serviceCategories.map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <th scope="row" className="px-5 py-4 font-semibold text-foreground">
                        {s.name}
                      </th>
                      <td className="px-5 py-4 font-semibold">{inr(s.basePrice)}</td>
                      <td className="hidden px-5 py-4 sm:table-cell text-muted-foreground">
                        {s.etaMinutes} min
                      </td>
                      <td className="hidden px-5 py-4 text-muted-foreground md:table-cell">
                        <span className="inline-flex items-center gap-1.5">
                          <Check className="h-4 w-4 text-success" aria-hidden="true" />
                          Inspection &amp; labour
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-8">
              <Button variant="accent" size="lg" onClick={handleGetAssistance}>
                Request assistance now
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
export default Services;
