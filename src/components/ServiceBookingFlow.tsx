import { useState } from "react";
import AvailabilityCalendar from "./AvailabilityCalendar";
import type { SelectedSlot } from "./AvailabilityCalendar";
import BookingForm from "./BookingForm";

interface Props {
  serviceId: string;
  serviceName: string;
  serviceType: "APPOINTMENT" | "CLASS";
}

export default function ServiceBookingFlow({ serviceId, serviceName, serviceType }: Props) {
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);

  const handleSuccess = (bookingId: string, startDate?: string) => {
    const params = new URLSearchParams();
    if (bookingId) params.set("bookingId", bookingId);
    if (startDate) params.set("startDate", startDate);
    if (serviceName) params.set("service", serviceName);
    window.location.href = `/booking-confirmation?${params.toString()}`;
  };

  if (!selectedSlot) {
    return (
      <AvailabilityCalendar
        serviceId={serviceId}
        serviceName={serviceName}
        serviceType={serviceType}
        onSlotSelected={setSelectedSlot}
      />
    );
  }

  return (
    <BookingForm
      serviceId={serviceId}
      serviceName={serviceName}
      serviceType={serviceType}
      slot={selectedSlot}
      onSuccess={handleSuccess}
      onCancel={() => setSelectedSlot(null)}
    />
  );
}
