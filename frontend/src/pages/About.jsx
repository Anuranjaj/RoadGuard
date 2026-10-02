import React from "react";
import { Heart, ShieldCheck, Timer } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SectionTitle } from "@/components/SectionTitle";

/**
 * Public About Page for RoadGuard
 */
export function About() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="bg-primary py-14 text-primary-foreground lg:py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-3xl font-bold sm:text-5xl">About RoadGuard</h1>
            <p className="mt-4 max-w-2xl text-primary-foreground/75">
              We started in 2023 after a founder spent four hours stranded on NH-66 waiting for a
              tow truck. Today RoadGuard dispatches verified help to thousands of drivers every day.
            </p>
          </div>
        </section>

        {/* Mission and Values */}
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionTitle eyebrow="Our mission" title="Nobody should be stranded and unsure" />
              <p className="mt-5 text-muted-foreground">
                Roadside help in India has traditionally meant calling around, negotiating prices in
                a stressful moment and hoping the mechanic is genuine. RoadGuard replaces that with
                a transparent marketplace: every partner is identity-verified, every price is shown
                before you confirm, and every job is tracked end to end.
              </p>
              <p className="mt-4 text-muted-foreground">
                We work with independent garages and towing operators, giving them steady demand and
                modern tools instead of competing with them.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: ShieldCheck,
                  t: "Safety first",
                  d: "Document checks and continuous quality monitoring for all partners.",
                },
                {
                  icon: Timer,
                  t: "Speed matters",
                  d: "Smart dispatch keeps the average arrival time under 15 minutes.",
                },
                {
                  icon: Heart,
                  t: "Fair to partners",
                  d: "Transparent commissions and weekly payouts for every garage.",
                },
              ].map((v) => (
                <article key={v.t} className="surface-card p-6">
                  <v.icon className="h-6 w-6 text-accent-foreground" aria-hidden="true" />
                  <h3 className="mt-3 font-display text-base font-semibold">{v.t}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{v.d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics Banner */}
        <section className="bg-secondary/60 py-14">
          <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {[
              { k: "18,400+", v: "Registered drivers" },
              { k: "1,247", v: "Verified partners" },
              { k: "92,430", v: "Services completed" },
              { k: "14 cities", v: "Live coverage" },
            ].map((s) => (
              <div key={s.v} className="surface-card p-6 text-center">
                <p className="font-display text-2xl font-bold sm:text-3xl">{s.k}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.v}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
export default About;
