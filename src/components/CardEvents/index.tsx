import React from "react";
import Image from "next/image";

type eventCardProps = {
  imageUrl: string;
  eventId: number;
  event_title: string;
  date: string;
  price: number;
  hasDiscount: boolean;
  is_free: boolean;
  location: string;
  isCompleted: boolean;
  onDetail: (eventId: number) => void;
};

const placeHolderImage =
  "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";

function index({
  imageUrl,
  eventId,
  event_title,
  date,
  price,
  hasDiscount,
  is_free,
  location,
  isCompleted,
  onDetail,
}: eventCardProps) {
  const displayImage = imageUrl.includes("example.com")
    ? placeHolderImage
    : imageUrl;

  const formattedDate = new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedPrice = Number(price).toLocaleString("id-ID");
  return (
    <div className="max-w-sm overflow-hidden rounded-lg border-4 border-black bg-white shadow-[8px_8px_0px_0px_#000000]">
      {/* discount badge */}
      <div className="relative">
        {hasDiscount && (
          <div className="absolute left-2 top-2 z-10 rounded bg-red-500 px-2 py-1 text-sm font-bold text-white">
            Discount
          </div>
        )}
        {isCompleted && (
          <div className="absolute right-2 top-2 z-10 rounded bg-green-500 px-2 py-1 text-sm font-bold text-white">
            Completed
          </div>
        )}
        <Image
          src={displayImage}
          alt={event_title}
          width={400}
          height={250}
          className="h-[250px] w-[400px] border-b-4 border-black object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="mb-2 text-2xl font-extrabold text-black">
          {event_title}
        </h3>
        <p className="text-lg text-gray-700">{formattedDate}</p>
        <p className="mb-4 text-lg text-gray-700">{location}</p>
        <p className="mb-4 text-lg font-bold text-black">
          {is_free ? "FREE" : `Rp. ${formattedPrice}`}
        </p>
        <button
          onClick={() => onDetail(eventId)}
          className="w-full transform rounded-lg border-4 border-black bg-violet-300 px-4 py-2 font-bold text-black transition-transform hover:scale-105 active:scale-95"
        >
          Details
        </button>
      </div>
    </div>
  );
}

export default index;
