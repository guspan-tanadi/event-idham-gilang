import React from "react";
import { UserRegistrations } from "@/models/models";

interface RegistrationCardProps {
  registration: UserRegistrations;
  onPay: (registrationId: number) => void;
  onAttend: (registrationId: number) => void;
  onReview: (registrationId: number) => void;
}

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getFullYear()}`;
};

function MyRegis({
  registration,
  onPay,
  onAttend,
  onReview,
}: RegistrationCardProps) {
  const { registration_id, quantity, registration_status, Payments, Event } =
    registration;

  const paymentStatus = Payments[0]?.payment_status;
  const paymentAmount = Payments[0]?.amount
    ? Number(Payments[0].amount).toLocaleString("id-ID")
    : "N/A";
  const isPaymentPending = paymentStatus === "PENDING";
  const isRegistered = registration_status === "REGISTERED";
  const isAttended = registration_status === "ATTENDED";
  const canAttend = isRegistered && paymentStatus === "COMPLETED";
  const canReview = isAttended && paymentStatus !== "PENDING";

  return (
    <div className="relative mb-6 w-full max-w-lg mx-auto min-h-[300px] rounded-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000000]">
      {/* Ticket Heading */}
      <div className="mb-4 flex items-center justify-between border-b-2 border-dashed border-gray-400 pb-4">
        <h3 className="text-2xl font-extrabold text-black truncate">
          {Event.event_title}
        </h3>
        <span className="rounded-full bg-blue-500 px-3 py-1 text-sm font-bold text-white">
          Ticket
        </span>
      </div>

      {/* Ticket Details */}
      <div className="flex flex-col md:flex-row md:justify-between">
        <div className="flex-1">
          <p className="mb-2 text-sm text-gray-700">
            <strong>Date:</strong> {formatDate(String(Event.date))}
          </p>
          <p className="mb-2 text-sm text-gray-700">
            <strong>Location:</strong> {Event.location}
          </p>
          <p className="mb-2 text-sm text-gray-700">
            <strong>Quantity:</strong> {quantity}
          </p>
        </div>
        <div className="flex-1 border-l-2 border-dashed border-gray-400 pl-4">
          <p className="mb-2 text-sm text-gray-700">
            <strong>Registration Status:</strong> {registration_status}
          </p>
          <p className="mb-2 text-sm text-gray-700">
            <strong>Amount:</strong> Rp. {paymentAmount}
          </p>
          <p className="mb-2 text-sm text-gray-700">
            <strong>Payment Status:</strong> {paymentStatus || "N/A"}
          </p>
        </div>
      </div>

      {/* Perforated Divider */}
      <div className="my-4 border-t-2 border-dotted border-gray-400"></div>

      {/* Action Buttons */}
      <div className="flex justify-around">
        {/* Pay Button */}
        <button
          disabled={!isPaymentPending}
          onClick={() => onPay(registration_id)}
          className={`rounded-lg border-2 border-black px-4 py-2 font-bold shadow-[2px_2px_0px_#000] transition-transform ${
            isPaymentPending
              ? "bg-green-500 text-white hover:scale-105 active:scale-95"
              : "cursor-not-allowed bg-gray-300 text-gray-500"
          }`}
          title={isPaymentPending ? "" : "Payment already completed"}
        >
          Pay
        </button>

        {/* Attend Button */}
        <button
          disabled={!canAttend}
          onClick={() => onAttend(registration_id)}
          className={`rounded-lg border-2 border-black px-4 py-2 font-bold shadow-[2px_2px_0px_#000] transition-transform ${
            canAttend
              ? "bg-blue-500 text-white hover:scale-105 active:scale-95"
              : "cursor-not-allowed bg-gray-300 text-gray-500"
          }`}
          title={canAttend ? "" : "Cannot attend until payment is completed"}
        >
          Attend
        </button>

        {/* Review Button */}
        <button
          disabled={!canReview}
          onClick={() => onReview(registration_id)}
          className={`rounded-lg border-2 border-black px-4 py-2 font-bold shadow-[2px_2px_0px_#000] transition-transform ${
            canReview
              ? "bg-yellow-500 text-black hover:scale-105 active:scale-95"
              : "cursor-not-allowed bg-gray-300 text-gray-500"
          }`}
          title={canReview ? "" : "Cannot review until event is attended"}
        >
          Review
        </button>
      </div>
    </div>
  );
}

export default MyRegis;
