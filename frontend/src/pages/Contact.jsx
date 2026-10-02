import React, { useState } from "react";
import { Mail, MapPin, Phone, ShieldCheck, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SectionTitle } from "@/components/SectionTitle";
import { Button } from "@/components/Button";

const contactDetails = [
  { icon: Phone, label: "Emergency helpline", value: "1800 123 4567", hint: "24x7, toll free" },
  { icon: Mail, label: "Email us", value: "support@roadguard.in", hint: "Replies within 2 hours" },
  {
    icon: MapPin,
    label: "Head office",
    value: "Infopark Phase 1, Kochi 682042",
    hint: "Kerala, India",
  },
];

/**
 * Public Contact & Support Page for RoadGuard
 */
export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    topic: "Assistance Inquiry",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      nextErrors.name = "Please enter your full name.";
    }
    if (!formData.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      nextErrors.message = "Tell us a little more (at least 10 characters).";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Banner */}
        <section className="bg-primary py-16 text-primary-foreground sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground/70">
              Contact
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-5xl">
              We are on the road with you, all day and night
            </h1>
            <p className="mt-4 max-w-2xl text-primary-foreground/80">
              Stranded right now? Call the emergency helpline. For everything else, send us a
              message and we will get back to you quickly.
            </p>
          </div>
        </section>

        {/* Contact Information & Form */}
        <section className="py-14 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
            {/* Left Column: Direct channels */}
            <div className="space-y-4">
              <SectionTitle eyebrow="Reach us" title="Support that actually answers" />
              <ul className="space-y-3 pt-2">
                {contactDetails.map((d) => (
                  <li key={d.label} className="surface-card flex items-start gap-4 p-5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary">
                      <d.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm text-muted-foreground">{d.label}</p>
                      <p className="font-display text-lg font-semibold">{d.value}</p>
                      <p className="text-xs text-muted-foreground">{d.hint}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="surface-card flex items-start gap-3 p-5">
                <ShieldCheck className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  All roadside service calls and customer inquiries are logged and monitored under
                  our safety SLA standard.
                </p>
              </div>
            </div>

            {/* Right Column: Contact Message Form */}
            <div className="surface-card p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold">Send us a message</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We typically respond within two hours during business operations.
              </p>

              {submitted ? (
                <div className="mt-8 rounded-xl bg-success/15 border border-success/30 p-6 text-center space-y-3">
                  <CheckCircle className="h-10 w-10 text-success mx-auto" />
                  <h3 className="font-display text-lg font-bold text-success">
                    Message Sent Successfully
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Thank you, {formData.name}. Our support team will get in touch with you shortly.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        topic: "Assistance Inquiry",
                        message: "",
                      });
                    }}
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Arjun Menon"
                      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-destructive">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                        Phone Number (optional)
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98470 21145"
                        className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="topic" className="block text-sm font-medium mb-1.5">
                      Topic / Reason
                    </label>
                    <select
                      id="topic"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="Assistance Inquiry">Assistance Inquiry</option>
                      <option value="Partner Onboarding">Partner Onboarding</option>
                      <option value="Billing &amp; Invoices">Billing &amp; Invoices</option>
                      <option value="Dispute Escalation">Dispute Escalation</option>
                      <option value="General Feedback">General Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1.5">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How can our support team assist you today?"
                      className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-destructive">{errors.message}</p>
                    )}
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
export default Contact;
