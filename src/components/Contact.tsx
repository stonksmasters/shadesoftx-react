import { useRef, useState } from "react";

type FormState = {
  first: string;
  last: string;
  email: string;
  phone: string;
  message: string;
};

export default function Contact() {
  const [form, setForm] = useState<FormState>({
    first: "",
    last: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const firstRef = useRef<HTMLInputElement | null>(null);

  const validate = (values: FormState) => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!values.first.trim()) e.first = "Please enter a first name.";
    if (!values.last.trim()) e.last = "Please enter a last name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = "Please enter a valid email.";
    if (!values.message.trim() || values.message.trim().length < 10) e.message = "Tell us more — 10+ characters.";
    return e;
  };

  const handleChange = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((s) => ({ ...s, [k]: e.target.value }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eobj = validate(form);
    setErrors(eobj);
    if (Object.keys(eobj).length) {
      // focus first error
      const firstErr = Object.keys(eobj)[0] as keyof FormState;
      if (firstErr === "first") firstRef.current?.focus();
      return;
    }

    setSubmitting(true);

    // Simulate a network request for demo purposes
    await new Promise((res) => setTimeout(res, 900));

    setSubmitting(false);
    setSuccess(true);

    // Reset after a little while, keep success visible briefly
    setTimeout(() => {
      setSuccess(false);
      setForm({ first: "", last: "", email: "", phone: "", message: "" });
    }, 3000);
  };

  return (
    <section aria-labelledby="contact-title" className="py-16 bg-bg">
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="text-center mb-8">
          <h2 id="contact-title" className="text-2xl md:text-3xl font-extrabold text-[var(--color-text)]">
            Get in Touch
          </h2>
          <p className="mt-3 text-md text-muted max-w-2xl mx-auto">
            Ready for a free estimate or have questions? Use the form or contact us directly — we typically reply within one business day.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Form (primary column on desktop) */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 panel rounded-2xl p-6 sm:p-8 shadow-sm"
            aria-label="Contact form"
            noValidate
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text)]">Request a Free Estimate</h3>
                <p className="mt-1 text-sm text-muted max-w-prose">
                  Tell us a little about your project and preferred timeframe. We’ll follow up to schedule a convenient time.
                </p>
              </div>

              <div className="hidden md:flex items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)]/10 px-3 py-2 text-sm font-semibold text-[var(--color-accent)]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M2 8.5A6.5 6.5 0 0111.5 2h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Free Estimate
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-3 py-2 text-sm font-semibold text-[var(--color-primary)]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Reliable Teams
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col">
                <span className="text-sm font-medium text-[var(--color-text)]">First name</span>
                <input
                  ref={firstRef}
                  name="first"
                  type="text"
                  value={form.first}
                  onChange={handleChange("first")}
                  required
                  placeholder="John"
                  aria-invalid={!!errors.first}
                  aria-describedby={errors.first ? "err-first" : undefined}
                  className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                {errors.first && (
                  <span id="err-first" className="mt-1 text-xs text-red-500">
                    {errors.first}
                  </span>
                )}
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-[var(--color-text)]">Last name</span>
                <input
                  name="last"
                  type="text"
                  value={form.last}
                  onChange={handleChange("last")}
                  required
                  placeholder="Doe"
                  aria-invalid={!!errors.last}
                  aria-describedby={errors.last ? "err-last" : undefined}
                  className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                {errors.last && (
                  <span id="err-last" className="mt-1 text-xs text-red-500">
                    {errors.last}
                  </span>
                )}
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <label className="flex flex-col">
                <span className="text-sm font-medium text-[var(--color-text)]">Email</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  required
                  placeholder="you@domain.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "err-email" : undefined}
                  className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                {errors.email && (
                  <span id="err-email" className="mt-1 text-xs text-red-500">
                    {errors.email}
                  </span>
                )}
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-[var(--color-text)]">Phone (optional)</span>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  placeholder="(555) 555-5555"
                  className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </label>
            </div>

            <label className="block mt-4">
              <span className="text-sm font-medium text-[var(--color-text)]">Message</span>
              <textarea
                name="message"
                rows={6}
                value={form.message}
                onChange={handleChange("message")}
                required
                placeholder="Tell us about your project — location, glass area, or any questions."
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "err-message" : undefined}
                className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 text-[var(--color-text)] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              {errors.message && (
                <span id="err-message" className="mt-1 text-xs text-red-500">
                  {errors.message}
                </span>
              )}
            </label>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold shadow transition ${
                  submitting ? "bg-[var(--color-primary)]/60 text-[var(--color-primary-content)] cursor-wait" : "bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:opacity-95"
                }`}
                aria-disabled={submitting}
              >
                {submitting ? "Sending…" : "Send Message"}
              </button>

              <div className="text-sm text-muted">
                <span className="block">Prefer to call? </span>
                <a href="tel:+18005551234" className="text-[var(--color-primary)] hover:underline">
                  (800) 555-1234
                </a>
              </div>

              <div className="ml-auto">
                <div className="text-xs text-muted">
                  We respect your privacy — your details are not shared.
                </div>
              </div>
            </div>

            {/* Success toast (in-form) */}
            {success && (
              <div
                role="status"
                aria-live="polite"
                className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
              >
                Thanks — your message has been queued (demo). We’ll contact you shortly.
              </div>
            )}
          </form>

          {/* Contact Info + Map (secondary column) */}
          <aside className="rounded-2xl p-6 sm:p-8 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text)]">Contact Info</h3>
              <p className="mt-2 text-sm text-muted">Call, email, or use the form — whichever works best for you.</p>
            </div>

            <dl className="mt-6 space-y-4">
              <div>
                <dt className="text-sm font-medium text-[var(--color-text)]">Phone</dt>
                <dd className="mt-1 text-sm">
                  <a href="tel:+18005551234" className="text-[var(--color-primary)] hover:underline">
                    (800) 555-1234
                  </a>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-[var(--color-text)]">Email</dt>
                <dd className="mt-1 text-sm">
                  <a href="mailto:hello@shadesoftx.com" className="text-[var(--color-primary)] hover:underline">
                    hello@shadesoftx.com
                  </a>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-[var(--color-text)]">Hours</dt>
                <dd className="mt-1 text-sm text-muted">Mon–Fri • 8:00am – 6:00pm</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-[var(--color-text)]">Service Area</dt>
                <dd className="mt-1 text-sm text-muted">Serving greater Texas — request a service area check and we'll confirm coverage.</dd>
              </div>
            </dl>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-[var(--color-text)] mb-3">Quick Links</h4>
              <ul className="flex flex-col gap-2 text-sm">
                <li>
                  <a href="/booking" className="text-[var(--color-primary)] hover:underline">
                    Book an Estimate
                  </a>
                </li>
                <li>
                  <a href="/residential" className="text-[var(--color-text)]/90 hover:underline">
                    Residential Services
                  </a>
                </li>
                <li>
                  <a href="/commercial" className="text-[var(--color-text)]/90 hover:underline">
                    Commercial Solutions
                  </a>
                </li>
              </ul>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-[var(--color-text)] mb-3">Office</h4>

              {/* lightweight map placeholder with theme-aware border and rounded corners */}
              <div className="w-full h-36 rounded-lg border border-[var(--color-border)] overflow-hidden">
                <div className="w-full h-full bg-[var(--color-bg)] flex items-center justify-center text-sm text-muted">
                  Map preview
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <a aria-label="Facebook" href="#" className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-content)]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M18 2h-3a4 4 0 00-4 4v3H8v4h3v8h4v-8h3l1-4h-4V6a1 1 0 011-1h3V2z" fill="currentColor" />
                </svg>
              </a>

              <a aria-label="Instagram" href="#" className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-[var(--color-accent)] text-white">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </a>

              <div className="text-sm text-muted">Follow us for tips and special offers.</div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}