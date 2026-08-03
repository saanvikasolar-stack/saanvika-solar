import { useState } from "react";
import { createClient, OAuthStrategy } from "@wix/sdk";
import { bookings } from "@wix/bookings";
import type { SelectedSlot } from "./AvailabilityCalendar";
import { WIX_CLIENT_ID } from "astro:env/client";

interface Props {
  serviceId: string;
  serviceName: string;
  serviceType: "APPOINTMENT" | "CLASS";
  slot: SelectedSlot;
  onSuccess: (bookingId: string, startDate: string) => void;
  onCancel: () => void;
}

const wixClient = createClient({
  modules: { bookings },
  auth: OAuthStrategy({ clientId: WIX_CLIENT_ID }),
});

const slotDisplay = (slot: SelectedSlot) =>
  slot.localStartDate
    ? new Date(slot.localStartDate).toLocaleString([], {
        weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : "";

export default function BookingForm({ serviceName, serviceType, slot, onSuccess, onCancel }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [participants, setParticipants] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waitlisted, setWaitlisted] = useState(false);

  const isWaitlist = serviceType === "CLASS" && !!slot.isFull;
  const maxParty = serviceType === "CLASS" ? Math.max(1, slot.bookableCapacity ?? slot.remainingCapacity ?? 1) : 1;
  const partyOptions = Array.from({ length: Math.min(maxParty, 8) }, (_, i) => i + 1);
  const isSurvey = /site survey/i.test(serviceName);

  const contactDetails = () => ({
    firstName: firstName.trim(),
    lastName: lastName.trim() || undefined,
    email: email.trim(),
    phone: phone.trim() || undefined,
  });

  const buildSlot = () =>
    serviceType === "CLASS"
      ? { serviceId: slot.serviceId, eventId: slot.eventId }
      : {
          serviceId: slot.serviceId,
          scheduleId: slot.scheduleId,
          startDate: slot.localStartDate,
          endDate: slot.localEndDate,
          timezone: slot.timezone,
          ...(slot.locationId
            ? { location: { _id: slot.locationId, locationType: slot.locationType as any } }
            : { location: { locationType: "OWNER_BUSINESS" as const } }),
        };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!firstName.trim() || !email.trim()) {
      setError("Please enter your first name and email.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await wixClient.bookings.createBooking({
        totalParticipants: participants,
        contactDetails: contactDetails(),
        selectedPaymentOption: "OFFLINE" as const,
        bookedEntity: { slot: buildSlot() },
      } as any);

      const status = result.booking?.status;
      const bookingId = result.booking?._id ?? "";
      const revision = result.booking?.revision ?? "";

      if (status === "WAITING_LIST") { setWaitlisted(true); setSubmitting(false); return; }

      const confirmRes = await fetch("/api/confirm-booking", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, revision }),
      });
      const confirmJson = await confirmRes.json().catch(() => ({}));
      if (!confirmRes.ok || confirmJson.ok === false) {
        setError("This slot just filled up — please pick another time.");
        setSubmitting(false); onCancel(); return;
      }
      onSuccess(bookingId, slot.localStartDate);
    } catch (err: any) {
      console.error("[booking] createBooking/confirm failed:", err);
      const full = `${err?.message ?? ""} ${JSON.stringify(err?.details ?? {})} ${String(err)}`;
      if (/SESSION_CAPACITY_EXCEEDED/i.test(full) || /no available spots/i.test(full)) {
        const sessionId = full.match(/on session ([^\s"}]+)/)?.[1];
        if (sessionId) {
          try {
            const res = await fetch("/api/waitlist", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId, totalParticipants: participants, contactDetails: contactDetails() }),
            });
            const j = await res.json().catch(() => ({}));
            if (res.ok && j.ok !== false) { setWaitlisted(true); setSubmitting(false); return; }
          } catch (e) { console.error("[waitlist] failed:", e); }
        }
        setError("This session is full and we couldn't add you to the waitlist — please try again later.");
        setSubmitting(false); return;
      }
      setError("This time slot was just taken. Please select another.");
      setSubmitting(false); onCancel();
    }
  };

  if (waitlisted) {
    return (
      <div className="booking-form">
        <div className="booking-form-header">
          <h3 className="booking-form-title">You're on the waitlist</h3>
          <p className="booking-form-subtitle">{serviceName} · {slotDisplay(slot)}</p>
        </div>
        <p>We'll email <strong>{email.trim()}</strong> if a spot opens up.</p>
        <button type="button" className="booking-cancel" onClick={onCancel}>← Back to available times</button>
      </div>
    );
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <div className="booking-form-header">
        <h3 className="booking-form-title">
          {isWaitlist ? "Join the waitlist" : isSurvey ? "Book your free survey" : "Confirm your booking"}
        </h3>
        <p className="booking-form-subtitle">
          {serviceName} · {slotDisplay(slot)}{slot.instructorName ? ` · with ${slot.instructorName}` : ""}
        </p>
        {isWaitlist && <p className="booking-form-note">This session is full — join the waitlist and we'll notify you if a spot opens.</p>}
        {!isWaitlist && isSurvey && (
          <p className="booking-form-note">
            A Saanvika engineer will visit your Kakinada rooftop, check shade and structure, and outline a clear next step — no obligation.
          </p>
        )}
      </div>

      {error && <p className="booking-error">{error}</p>}

      <div className="booking-field-row">
        <div className="booking-field">
          <label className="booking-label booking-label--required" htmlFor="bf-first">First name</label>
          <input id="bf-first" className="booking-input" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required autoComplete="given-name" />
        </div>
        <div className="booking-field">
          <label className="booking-label" htmlFor="bf-last">Last name</label>
          <input id="bf-last" className="booking-input" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
        </div>
      </div>

      <div className="booking-field">
        <label className="booking-label booking-label--required" htmlFor="bf-email">Email</label>
        <input id="bf-email" className="booking-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </div>

      <div className="booking-field">
        <label className="booking-label" htmlFor="bf-phone">Phone</label>
        <input id="bf-phone" className="booking-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+91 …" />
      </div>

      {!isWaitlist && maxParty > 1 && (
        <div className="booking-field">
          <label className="booking-label" htmlFor="bf-party">Number of spots</label>
          <select id="bf-party" className="booking-input" value={participants} onChange={(e) => setParticipants(Number(e.target.value))}>
            {partyOptions.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      )}

      <button type="submit" className="booking-submit" disabled={submitting}>
        {submitting
          ? (isWaitlist ? "Joining…" : "Confirming…")
          : isWaitlist
            ? "Join Waitlist"
            : isSurvey
              ? "Confirm free survey"
              : "Confirm Booking"}
      </button>
      <button type="button" className="booking-cancel" onClick={onCancel} disabled={submitting}>← Back to available times</button>
    </form>
  );
}
