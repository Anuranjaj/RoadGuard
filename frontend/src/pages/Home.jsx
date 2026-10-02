import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  MapPinned,
  PhoneCall,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import heroImage from "@/assets/hero-roadside.jpg";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { ServiceCard } from "@/components/ServiceCard";
import { SectionTitle } from "@/components/SectionTitle";
import { serviceCategories } from "@/data/mockData";
import { isAuthenticatedSession, useSession } from "@/utils/helpers";

const steps = [
  { title: "Select Service", body: "Choose the type of roadside assistance you need." },
  { title: "Share Location", body: "Confirm exactly where your vehicle is stranded." },
  { title: "Choose a Partner", body: "Compare nearby mechanics on price, rating and ETA." },
  { title: "Track & Get Help", body: "Follow your partner live until they reach you." },
];

/**
 * Public Home Page for RoadGuard platform
 */
export function Home() {
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
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary text-primary-foreground">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs font-semibold">
                <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
                1,200+ verified partners across India
              </span>
              <h1 className="mt-5 text-balance-tight font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Roadside Assistance When You Need It Most
              </h1>
              <p className="mt-5 max-w-xl text-base text-primary-foreground/75 sm:text-lg">
                Breakdown, flat tyre, dead battery or an empty tank — find verified mechanics and
                towing partners nearby, see the price before you book, and track them live until
                they arrive.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="emergency"
                  size="xl"
                  className="w-full sm:w-auto"
                  onClick={handleGetAssistance}
                >
                  Get Roadside Assistance <ArrowRight className="h-5 w-5" />
                </Button>
                <Link to="/register">
                  <Button
                    size="xl"
                    variant="outline"
                    className="w-full sm:w-auto border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    Become a Service Partner
                  </Button>
                </Link>
              </div>
              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-primary-foreground/15 pt-6">
                {[
                  { k: "12 min", v: "Average arrival" },
                  { k: "92,000+", v: "Services completed" },
                  { k: "4.8 / 5", v: "Customer rating" },
                ].map((s) => (
                  <div key={s.v}>
                    <dt className="font-display text-xl font-bold sm:text-2xl">{s.k}</dt>
                    <dd className="text-xs text-primary-foreground/65 sm:text-sm">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <img
                src={heroImage}
                alt="RoadGuard mechanic assisting a stranded driver at dusk"
                width={1600}
                height={1200}
                className="w-full rounded-2xl object-cover shadow-[var(--shadow-float)]"
              />
              <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-xl bg-card p-4 text-card-foreground shadow-[var(--shadow-float)] sm:left-8">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-success/15 text-success">
                  <BadgeCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Raj Auto Care is 1.2 km away</p>
                  <p className="text-xs text-muted-foreground">Arriving in 8 minutes · ₹650</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Strip */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {[
              { icon: ShieldCheck, t: "Verified partners", d: "ID and licence checked" },
              { icon: Clock3, t: "24x7 dispatch", d: "Day, night and holidays" },
              { icon: Star, t: "Upfront pricing", d: "No surprise charges" },
              { icon: MapPinned, t: "Live tracking", d: "Know exactly when help arrives" },
            ].map((f) => (
              <div key={f.t} className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                  <f.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{f.t}</p>
                  <p className="text-xs text-muted-foreground">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Services Section */}
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionTitle
            center
            eyebrow="Our services"
            title="Every roadside emergency, covered"
            description="Transparent starting prices. Pay only for what you need."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {serviceCategories.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
            <article className="surface-card flex flex-col justify-center gap-3 bg-primary p-6 text-primary-foreground">
              <PhoneCall className="h-8 w-8 text-accent" aria-hidden="true" />
              <h3 className="font-display text-lg font-semibold">Not sure what's wrong?</h3>
              <p className="text-sm text-primary-foreground/75">
                Talk to a RoadGuard expert and we'll dispatch the right partner for you.
              </p>
              <Link to="/contact" className="mt-2 self-start">
                <Button variant="accent">Call 1800 202 4455</Button>
              </Link>
            </article>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-secondary/60 py-16 lg:py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              center
              eyebrow="How it works"
              title="Help in four simple steps"
              description="From breakdown to back-on-road, the whole journey takes minutes."
            />
            <ol className="mt-12 grid gap-6 md:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.title} className="relative surface-card p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-accent font-display text-base font-bold text-accent-foreground">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionTitle center eyebrow="Trusted daily" title="What drivers say" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                q: "Battery died at 11 PM near Vyttila. A verified mechanic reached me in 9 minutes.",
                n: "Priya Sankar",
                c: "Hyundai i20 owner",
              },
              {
                q: "Towing was arranged in one tap and I could watch the truck on the map the whole time.",
                n: "Sabu Thomas",
                c: "Tata Nexon EV owner",
              },
              {
                q: "Clear pricing before booking. The invoice matched the estimate exactly.",
                n: "Meera Krishnan",
                c: "Honda City owner",
              },
            ].map((t) => (
              <figure key={t.n} className="surface-card p-6">
                <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed">“{t.q}”</blockquote>
                <figcaption className="mt-4 text-sm font-semibold">
                  {t.n}
                  <span className="block text-xs font-normal text-muted-foreground">{t.c}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Partner CTA */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="surface-card flex flex-col items-start gap-6 bg-primary p-8 text-primary-foreground sm:p-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <Users className="h-8 w-8 text-accent" aria-hidden="true" />
              <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
                Grow your garage with RoadGuard
              </h2>
              <p className="mt-3 text-primary-foreground/75">
                Receive nearby service requests, set your own pricing and get paid weekly. Free to
                join, verification in 48 hours.
              </p>
            </div>
            <Link to="/register">
              <Button variant="accent" size="xl">
                Become a Service Partner
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
export default Home;
