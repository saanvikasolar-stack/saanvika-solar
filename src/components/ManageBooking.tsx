import { useState } from "react";
import { createClient, OAuthStrategy } from "@wix/sdk";
import { bookings } from "@wix/bookings";
import { WIX_CLIENT_ID } from "astro:env/client";

interface Props {
  token: string | null;
  revision: string;
  serviceName: string;
  startDate: string | null;
  status: string | null;
  canCancel: boolean;
  showSummary?: boolean;
}

const wixClient = createClient({
  modules: { bookings },
  auth: OAuthStrategy({ clientId: WIX_CLIENT_ID }),
});

const fmt = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleString([], { weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function ManageBooking({ token, revision, serviceName, startDate, status, canCancel, showSummary }: Props) {
  const [state, setState] = useState<"idle" | "canceling" | "canceled" | "error">(
    status === "CANCELED" ? "canceled" : "idle",
  );
  const when = fmt(startDate);

  const handleCancel = async () => {
    if (!token) return;
    setState("canceling");
    try {
      await wixClient.bookings.bookingsCancelBookingAnonymously(token, revision);
      setState("canceled");
    } catch (err) {
      console.error("[manage-booking] cancel failed:", err);
      setState("error");
    }
  };

  if (state === "canceled") {
    return (
      <div className="manage-booking">
        <p className="manage-booking-status">
          Your booking for <strong>{serviceName}</strong>{when ? <> on <strong>{when}</strong></> : null} is canceled.
        </p>
        <a href="/services/free-site-survey" className="booking-submit" style={{ display: "inline-block" }}>
          Book a free site survey
        </a>
      </div>
    );
  }

  return (
    <div className="manage-booking">
      {showSummary !== false && (
        <p className="manage-booking-summary">
          <strong>{serviceName}</strong>{when ? <> · {when}</> : null}
        </p>
      )}
      {state === "error" && <p className="booking-error">Something went wrong canceling your booking. Please try again.</p>}
      {canCancel ? (
        <button type="button" className="booking-submit" onClick={handleCancel} disabled={state === "canceling"}>
          {state === "canceling" ? "Canceling…" : "Cancel this booking"}
        </button>
      ) : (
        <p className="manage-booking-note">This booking can no longer be canceled online.</p>
      )}
      <p className="manage-booking-note">
        Need a different time? Cancel above, then{" "}
        <a href="/services" className="manage-booking-link">pick another slot</a>.
      </p>
    </div>
  );
}
