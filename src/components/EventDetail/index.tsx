import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

type EventDetailProps = {
  event_title: string;
  description: string;
  category: "MUSIC" | "SPORTS" | "EDUCATION" | "TECHNOLOGY";
  price: number;
  date: Date;
  time: Date;
  location: string;
  seat_quantity: number;
  image_url: string;
};

const EventDetail = () => {
  const router = useRouter();
  const { event_id } = router.query;
  const [event, setEvent] = useState<EventDetailProps | null>(null);

  useEffect(() => {
    if (event_id) {
      // Fetch event details based on the event_id from the URL
      axios
        .get(`/api/user/events/${event_id}`)
        .then((response) => {
          setEvent(response.data.data);
        })
        .catch((error) => {
          console.error("Error fetching event details:", error);
        });
    }
  }, [event_id]);

  if (!event) {
    return (
      <div className="flex h-screen items-center justify-center text-2xl font-bold text-gray-700">
        Loading Event Details...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-yellow-200 via-red-200 to-pink-200 p-6">
      {/* Large Event Image */}
      <div className="w-full max-w-4xl overflow-hidden rounded-lg border-4 border-black shadow-[8px_8px_0px_#000000]">
        <Image
          src={event.image_url}
          alt={event.event_title}
          className="w-full h-[400px] object-cover border-b-4 border-black"
        />
      </div>

      {/* Event Details */}
      <div className="w-full max-w-4xl mt-6 p-6 bg-white rounded-lg border-4 border-black shadow-[8px_8px_0px_#000000] space-y-4">
        <h1 className="text-3xl font-extrabold text-black mb-4">{event.event_title}</h1>
        
        <p className="text-lg text-gray-800 border-b-2 border-black pb-2">
          <strong>Description:</strong> {event.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="text-lg text-gray-800">
            <strong>Category:</strong> {event.category}
          </div>
          <div className="text-lg text-gray-800">
            <strong>Price:</strong> Rp. {event.price.toLocaleString("id-ID")}
          </div>
          <div className="text-lg text-gray-800">
            <strong>Date:</strong> {new Date(event.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
          <div className="text-lg text-gray-800">
            <strong>Time:</strong> {new Date(event.time).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="text-lg text-gray-800">
            <strong>Location:</strong> {event.location}
          </div>
          <div className="text-lg text-gray-800">
            <strong>Seat Quantity:</strong> {event.seat_quantity}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
