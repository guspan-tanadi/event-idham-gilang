"use client";

import React, { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { Events, Discounts, Reviews } from "@/models/models";
import LoadingSpinner from "@/components/LoadingSpinner";
import MyNavbar from "@/components/MyNavbar";
import MyFooter from "@/components/MyFooter";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

function Page() {
  type Params = {
    event_id: string;
  };
  
  type TokenPayload = {
    id: number;
    role: string;
  };
  
  type User = {
    userId: number;
    username: string;
    email: string;
    fullname: string;
    role: string;
  };
  
  const { event_id } = useParams() as Params;
  const MySwal = withReactContent(Swal);

  const [event, setEvent] = useState<Events | null>(null);
  const [reviews, setReviews] = useState<Reviews[]>([]);
  const [discount, setDiscount] = useState<Discounts[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [tokenPayload, setTokenPayload] = useState<TokenPayload | null>(null);
  const [pagePrice, setPagePrice] = useState<number | undefined>(0);

  //for loadings
  const isEventLoadingRef = useRef(true);
  const isReviewsLoadingRef = useRef(true);
  const router = useRouter();

  function toggleMenu() {
    setIsMenuOpen(!isMenuOpen);
  }

  async function getEventById(event_id: number) {
    try {
      isEventLoadingRef.current = true;
      const token = Cookies.get("access_token");
      const response = await axios.get(`api/user/events/${event_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setEvent(response.data.data);
    } catch (error) {
      console.error("Failed to fetch event details:", error);
      setEvent(null);
    } finally {
      isEventLoadingRef.current = false;
    }
  }

  async function getDiscountByEventId(event_id: number) {
    try {
      const token = Cookies.get("access_token");
      const response = await axios.get(`api/user/events/discount/${event_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setDiscount(response.data.data);
    } catch (error) {
      console.error("Failed to fetch event details:", error);
      setDiscount([]);
    }
  }

  async function getReviewsByEventId(event_id: number) {
    try {
      isReviewsLoadingRef.current = true;
      const response = await axios.get(
        `api/user/reviews/event/${event_id}`,
      );
      setReviews(response.data.data);
    } catch (error) {
      console.error("Failed to fetch reviews: ", error);
      setReviews([]);
    } finally {
      isReviewsLoadingRef.current = false;
    }
  }

  async function getUserById(userId: number) {
    try {
      const token = Cookies.get("access_token");
      const response = await axios.get(
        `api/user/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setUser(response.data.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("user_info");
    setUser(null);
    window.location.href = "/";
  };

  const handleRegister = async () => {
    if (!event) return;

    const eventDate = new Date(event.date);
    const currentDate = new Date();
    if (eventDate < currentDate) {
      await MySwal.fire({
        icon: "warning",
        title: "Event Already Completed",
        text: "This event has already taken place. Registration is no longer available.",
      });
      return;
    }

    if (tokenPayload) {
      const { value: ticketQuantity } = await MySwal.fire({
        title: "Register for Event",
        text: "Select the number of tickets you want to acquire",
        input: "select",
        inputOptions: {
          1: "1 Ticket",
          2: "2 Tickets",
          3: "3 Tickets",
          4: "4 Tickets",
          5: "5 Tickets",
        },
        inputPlaceholder: "Select quantity",
        showCancelButton: true,
        confirmButtonText: "Register",
        cancelButtonText: "Cancel",
        inputValidator: (value) => {
          if (!value) {
            return "Please select a quantity!";
          }
        },
      });

      if (ticketQuantity) {
        if (ticketQuantity > (event?.seat_quantity || 0)) {
          MySwal.fire({
            icon: "warning",
            title: "Not Enough Seats Available",
            text: `Only ${event?.seat_quantity} seats are available. Please select a smaller quantity.`,
          });
          return; // Stop further execution if the quantity is greater than available seats
        }
        try {
          const token = Cookies.get("access_token");
          await axios.post(
            `/api/user/register`,
            {
              event_id: event?.event_id,
              user_id: tokenPayload.id,
              quantity: ticketQuantity,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          // Show a success message
          MySwal.fire({
            icon: "success",
            title: "Registered!",
            text: `You have successfully registered for ${ticketQuantity} ticket(s)!`,
          }).then(() => {
            router.push("/");
          });
        } catch (error) {
          // Handle any errors from the registration process
          MySwal.fire({
            icon: "error",
            title: "Registration Failed",
            text: "An error occurred while registering. Please try again.",
          });
          console.error(error);
        }
      }
    } else {
      // If user is not logged in, redirect to the login page
      MySwal.fire({
        icon: "info",
        title: "Login Required",
        text: "Please log in to register for the event.",
        confirmButtonText: "Go to Login",
      }).then(() => {
        router.push("/auth/login");
      });
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-yellow-400 ${i <= rating ? "text-yellow-500" : "text-gray-300"}`}
        >
          ★
        </span>,
      );
    }
    return <div className="flex">{stars}</div>;
  };

  useEffect(function checkLoginStatus() {
    const accessToken = Cookies.get("access_token");
    if (!accessToken) {
      MySwal.fire({
        icon: "error",
        title: "Unauthorized",
        text: "You are not authorized to access this page.",
        confirmButtonText: "Go to Login",
      }).then(() => {
        router.push("/auth/login");
      });
      return; // Stop further execution if role is not USER
    } else {
      try {
        const decodedToken: TokenPayload = jwtDecode(accessToken);
        setTokenPayload({
          id: decodedToken.id,
          role: decodedToken.role,
        });
      } catch (error) {
        console.error("Invalid token or decoding error:", error); // Log any decoding errors
        setTokenPayload(null); // Ensure state is updated if there’s an error
      }
    }
  }, [MySwal, router]);

  useEffect(() => {
    if (event && discount.length > 0) {
      const discountData = discount[0];

      if (event.is_free) {
        setPagePrice(0);
      } else if (event.discounted_price !== 0 && discount) {
        const now = new Date();
        const startDate = new Date(discountData.start_date);
        const endDate = new Date(discountData.end_date);

        if (now >= startDate && now <= endDate) {
          setPagePrice(event.discounted_price);
        } else {
          setPagePrice(event.price);
        }
      } else {
        setPagePrice(event.price);
      }
    } else {
      setPagePrice(event?.price);
    }
  }, [event, discount]);

  useEffect(() => {
    if (tokenPayload?.id) {
      getUserById(tokenPayload.id);
    }
  }, [tokenPayload]);

  useEffect(() => {
    getEventById(Number(event_id));
    getDiscountByEventId(Number(event_id));
    getReviewsByEventId(Number(event_id));
  }, [event_id]);

  return (
    <div className="flex min-h-[900px] min-w-75 bg-gradient-to-br from-yellow-200 via-red-200 to-pink-200">
      {/* navbar */}
      <MyNavbar
        user={user}
        onLogout={handleLogout}
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
      />

      {/* main content */}
      <div className="grid h-full w-screen grid-cols-1 gap-7 px-6 pb-115 pt-28 md:pb-52">
        {/* Check if event is loaded */}
        {isEventLoadingRef.current ? (
          <LoadingSpinner />
        ) : event ? (
          <>
            {/* Event Image */}
            <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-lg border-4 border-black shadow-[8px_8px_0px_#000000]">
              <img
                src={event.image_url}
                alt={event.event_title}
                className="h-[400px] w-full border-b-4 border-black object-cover"
              />
            </div>

            {/* Event Details */}
            <div className="mx-auto w-full max-w-4xl space-y-4 rounded-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000000]">
              <h1 className="mb-4 text-3xl font-extrabold text-black">
                {event.event_title}
              </h1>
              <p className="border-b-2 border-black pb-2 text-lg text-gray-800">
                <strong>Description:</strong> {event.description}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="text-lg text-gray-800">
                  <strong>Category:</strong> {event.category}
                </div>
                <div className="text-lg text-gray-800">
                  <strong>Price:</strong> Rp.{" "}
                  {Number(pagePrice).toLocaleString("id-ID")}
                </div>
                <div className="text-lg text-gray-800">
                  <strong>Date:</strong>{" "}
                  {new Date(event.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <div className="text-lg text-gray-800">
                  <strong>Time:</strong>{" "}
                  {new Date(event.time).toLocaleTimeString("en-GB", {
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

              <button
                onClick={handleRegister}
                className="mt-20 w-full transform rounded-lg border-4 border-black bg-blue-500 px-4 py-3 text-2xl font-bold text-white shadow-[4px_4px_0px_#000000] transition-transform hover:scale-105 active:scale-95"
              >
                Register
              </button>
            </div>
          </>
        ) : (
          <div className="text-center text-2xl font-bold text-gray-700">
            Event not found
          </div>
        )}

        <div className="mx-auto mt-10 w-full max-w-4xl space-y-6 rounded-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000000]">
          <h2 className="text-2xl font-bold text-black">User Reviews</h2>

          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div
                key={review.review_id}
                className="border-b border-gray-300 pb-4"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-black">
                    {review.User.username || "Anonymous"}
                  </span>
                  <span>{renderStars(review.rating)}</span>
                </div>
                <div className="text-gray-800">{review.comment}</div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">
              No reviews yet. Be the first to review this event!
            </p>
          )}
        </div>
      </div>

      {/* footer */}
      <MyFooter />
    </div>
  );
}

export default Page;