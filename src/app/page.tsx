"use client";
import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import CardEvents from "@/components/CardEvents";
import MyNavbar from "@/components/MyNavbar";
import MyFooter from "@/components/MyFooter";
import LoadingSpinner from "@/components/LoadingSpinner";
import { jwtDecode } from "jwt-decode";
import {
  Events,
  Discounts,
  UserRegistrations,
  TokenPayload,
  Users,
} from "@/models/models";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import React from "react";
import MyRegis from "@/components/MyRegis";
import { useCallback } from "react";
axios.defaults.baseURL = process.env.NEXT_PUBLIC_AXIOS_BASE_URL;

function Page() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [events, setEvents] = useState<Events[]>([]);
  const [discounts, setDiscounts] = useState<Discounts[]>([]);
  const [registrations, setRegistrations] = useState<UserRegistrations[]>([]);
  const [user, setUser] = useState<Users | null>(null);
  const [tokenPayload, setTokenPayload] = useState<TokenPayload | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  //useState for searching events
  const [eventName, setEventName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const categories = ["MUSIC", "SPORTS", "EDUCATION", "TECHNOLOGY"];

  //useState for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  //useState for loading
  const forceUpdate = React.useReducer(() => ({}), {})[1] as () => void;
  const loadingRef = useRef(true);
  const regisLoadingRef = useRef(false);

  const router = useRouter();
  const MySwal = withReactContent(Swal);

  const searchParams = useSearchParams();

  useEffect(() => {
    const redirected = searchParams.get("redirected");
    if (redirected) {
      // Navigate to "/" without query parameters and reload the page
      window.location.replace("/");
    }
  }, [searchParams]);

  const fetchData = useCallback( async() => {
    loadingRef.current = true;
    forceUpdate();
    try {
      const eventResponse = await axios.get("api/user/events");
      setEvents(eventResponse.data.data);

      const discountResponse = await axios.get("api/user/events/discount");
      setDiscounts(discountResponse.data.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      loadingRef.current = false;
      forceUpdate();
    }
  }, [forceUpdate])

  //logic for searching with debounce
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  async function fetchEvents(
    eventName: string,
    location: string,
    category: string,
  ) {
    try {
      const searchResponse = await axios.get("api/user/events", {
        params: {
          search: eventName,
          location,
          category,
        },
      });
      setEvents(searchResponse.data.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }

  function handleSearch() {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      fetchEvents(eventName, location, category);
    }, 500);
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

  async function getUserRegistrations(userId: number) {
    regisLoadingRef.current = true;
    forceUpdate();
    try {
      const token = Cookies.get("access_token");
      const response = await axios.get(
        `api/user/registrations/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setRegistrations(response.data.data);
    } catch (error) {
      console.error("Error fetching user registration: ", error);
    } finally {
      regisLoadingRef.current = false;
      forceUpdate();
    }
  }

  async function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;

    // Update state based on input name
    if (name === "eventName") {
      setEventName(value);
    } else if (name === "location") {
      setLocation(value);
    } else if (name === "category") {
      setCategory(value);
    }
  }

  //pagination logic
  const totalPages = Math.ceil(events.length / pageSize);
  const currentEvents = events.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  //event pricing logic
  const getActiveDiscount = (eventId: number): Discounts | undefined => {
    const currentDate = new Date();
    return discounts.find(
      (discount) =>
        discount.event_id === eventId &&
        new Date(discount.start_date) <= currentDate &&
        new Date(discount.end_date) >= currentDate,
    );
  };

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("user_info");
    setUser(null);
    window.location.reload();
  };

  function toggleMenu() {
    setIsMenuOpen(!isMenuOpen);
  }

  const handleNavigate = (event_id: number) => {
    const accessToken = Cookies.get("access_token");
    if (!accessToken) {
      Swal.fire({
        title: "Login Required",
        text: "You need to log in to view event details.",
        icon: "warning",
        confirmButtonText: "Login",
        showCancelButton: true,
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/auth/login");
        }
      });
    } else {
      router.push(`/user/detail-event/${event_id}`);
    }
  };

  const handlePayment = async (registration_id: number) => {
    const { value: paymentMethod } = await MySwal.fire({
      title: "Select Payment Method",
      input: "select",
      inputOptions: {
        CREDIT_CARD: "Credit Card",
        QRIS: "QRIS",
        BANK_TRANSFER: "Bank Transfer",
      },
      inputPlaceholder: "Choose a payment method",
      showCancelButton: true,
      confirmButtonText: "Pay",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value) {
          return "Please select a payment method!";
        }
      },
    });

    if (paymentMethod) {
      try {
        const token = Cookies.get("access_token");
        // Call the payment API with the selected payment method
        await axios.post(
          "/api/user/payments",
          {
            registration_id,
            payment_method: paymentMethod,
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
          title: "Payment Successful",
          text: "Your payment has been processed successfully!",
        });

        if (tokenPayload?.id) {
          getUserRegistrations(tokenPayload.id);
        }
      } catch (error) {
        // Handle any errors from the payment process
        MySwal.fire({
          icon: "error",
          title: "Payment Failed",
          text: "An error occurred while processing your payment. Please try again.",
        });
        console.error("Error during payment:", error);
      }
    }
  };

  const handleAttend = async (registration_id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to mark this event as attended?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, mark as attended",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const token = Cookies.get("access_token");
        await axios.patch(
          `/api/user/attend/${registration_id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        MySwal.fire({
          icon: "success",
          title: "Event Attended",
          text: "You have attended the event, Thank You",
        });
        if (tokenPayload?.id) {
          getUserRegistrations(tokenPayload.id);
        }
      } catch (error) {
        MySwal.fire({
          icon: "error",
          title: "Attend Process Failed",
          text: "An error occurred while processing. Please try again.",
        });
        console.error("Error during attend:", error);
      }
    }
  };

  const handleReview = async (registration_id: number) => {
    // registration_id, user_id, rating, comment
    const user_id = tokenPayload?.id;
    if (!user_id) {
      Swal.fire("Error", "User not logged in", "error");
      return;
    }

    try {
      const token = Cookies.get("access_token");
      const response = await axios.get(`/api/user/reviews/user/${user_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userIdReviews = response.data.data;

      const existingReview = userIdReviews.find(
        (userIdReviews: { registration_id: number }) =>
          userIdReviews.registration_id === registration_id,
      );

      if (existingReview) {
        // If a review exists, show a SweetAlert message
        Swal.fire("Info", "You have already reviewed this event.", "info");
        return; // Exit the function early
      }
      const { value: formValues } = await Swal.fire({
        title: "Submit Your Review",
        html: `
       <div style="display: flex; flex-direction: column; align-items: flex-start;">
        <label for="rating" style="font-weight: bold; margin-bottom: 5px;">Rating (0-5):</label>
        <select id="rating" style="width: 100%; padding: 8px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 5px;">
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
  
        <label for="comment" style="font-weight: bold; margin-bottom: 5px;">Comment:</label>
        <textarea id="comment" placeholder="Enter your comment" style="width: 100%; height: 100px; padding: 8px; border: 1px solid #ccc; border-radius: 5px; resize: none;"></textarea>
      </div>
    `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Submit",
        cancelButtonText: "Cancel",
        preConfirm: () => {
          const ratingElement = document.getElementById(
            "rating",
          ) as HTMLInputElement;
          const commentElement = document.getElementById(
            "comment",
          ) as HTMLTextAreaElement;

          const rating = Number(ratingElement?.value);
          const comment = commentElement?.value || "";

          // Validation checks
          if (rating < 0 || rating > 5 || isNaN(rating)) {
            Swal.showValidationMessage(
              "Please enter a valid rating between 0 and 5.",
            );
            return;
          }
          if (comment.length > 256) {
            Swal.showValidationMessage(
              "Comment should not exceed 256 characters.",
            );
            return;
          }
          return { rating, comment };
        },
      });

      if (formValues) {
        const { rating, comment } = formValues;
        try {
          const token = Cookies.get("access_token");
          await axios.post(
            "/api/user/reviews",
            {
              registration_id,
              user_id,
              rating,
              comment,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          MySwal.fire({
            icon: "success",
            title: "Review Recorded",
            text: "You have reviewed the event, Thank You",
          });
        } catch (error) {
          MySwal.fire({
            icon: "error",
            title: "Review Process Failed",
            text: "An error occurred while processing your review. Please try again.",
          });
          console.error("Error during review:", error);
        }
      }
    } catch (error) {
      Swal.fire(
        "Error",
        "Failed to fetch reviews. Please try again later.",
        "error",
      );
      console.error("Error fetching reviews:", error);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    handleSearch();
  }, [eventName, location, category]);

  // Check cookies for access token and user info on component mount
  useEffect(function checkLoginStatus() {
    const accessToken = Cookies.get("access_token");
    setIsLoggedIn(!!accessToken);
    if (accessToken) {
      try {
        const decodedToken: TokenPayload = jwtDecode(accessToken);

        setTokenPayload({
          id: decodedToken.id,
          role: decodedToken.role,
        });

        console.log("user_id: ", decodedToken.id);
        console.log("role: ", decodedToken.role);
        
      } catch (error) {
        console.error("Invalid token or decoding error:", error); // Log any decoding errors
        setTokenPayload(null); // Ensure state is updated if there’s an error
      }
    }
  }, []);

  useEffect(() => {
    if (tokenPayload?.id) {
      getUserById(tokenPayload.id);
      getUserRegistrations(tokenPayload.id);
    }
  }, [tokenPayload]);

  return (
    <div className="flex min-h-[900px] min-w-75 bg-gradient-to-br from-yellow-200 via-red-200 to-pink-200">
      <MyNavbar
        user={user}
        onLogout={handleLogout}
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
      />

      {/* main content */}
      <div className="grid h-full w-screen grid-cols-1 gap-7 pb-96 pt-16">
        {/* hero section */}
        <div
          className="relative h-full bg-cover bg-center"
          style={{
            backgroundImage: `url("https://wallpapers.com/images/featured/concert-background-dd0syeox7rmi78l0.jpg")`,
          }}
        >
          <div className="relative z-10 flex h-125 flex-col items-center justify-center p-5 text-center text-white">
            <h1 className="relative z-10 rounded-lg border-4 border-black bg-yellow-300 px-4 py-2 text-5xl font-bold text-black shadow-[8px_8px_0px_#000]">
              Welcome to MyTicket
            </h1>
            <p className="relative mt-3 rounded-lg border-4 border-black bg-pink-200 px-3 py-1 text-lg font-semibold text-black shadow-[6px_6px_0px_#000]">
              Bringing You Closer to Events That Inspire, Entertain, and
              Educate!
            </p>
          </div>
        </div>

        {/* Event list */}
        <div className="mb-3 grid w-full grid-cols-1 px-5">
          {/* search bar and others */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4"
          >
            <input
              type="text"
              name="eventName"
              placeholder="Search by event name"
              value={eventName}
              onChange={handleInputChange}
              className="rounded-lg border-4 border-black bg-yellow-300 p-2 font-semibold text-black placeholder-gray-600 shadow-[6px_6px_0px_#000000] focus:outline-none"
            />
            <input
              type="text"
              name="location"
              placeholder="Search by location"
              value={location}
              onChange={handleInputChange}
              className="rounded-lg border-4 border-black bg-yellow-300 p-2 font-semibold text-black placeholder-gray-600 shadow-[6px_6px_0px_#000000] focus:outline-none"
            />
            <select
              name="category"
              value={category}
              onChange={handleInputChange}
              className="relative appearance-none rounded-lg border-4 border-black bg-yellow-300 p-2 font-semibold text-black shadow-[6px_6px_0px_#000000] focus:outline-none"
              style={{
                WebkitAppearance: "none", // hides default dropdown arrow in some browsers
                MozAppearance: "none", // hides default dropdown arrow in Firefox
                backgroundImage:
                  "url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27black%27%3E%3Cpath d=%27M7 10l5 5 5-5z%27/%3E%3C/svg%3E')",
                backgroundPosition: "right 0.75rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1rem",
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="w-full transform rounded-lg border-4 border-black bg-blue-500 py-2 font-bold text-white shadow-[6px_6px_0px_#000000] transition-transform hover:scale-105 active:scale-95"
            >
              Search
            </button>
          </form>

          {/* event cards */}
          <div className="mb-3 grid w-full grid-cols-1">
            <div className="grid grid-cols-1 place-items-center gap-10 pb-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {loadingRef.current ? (
                <LoadingSpinner />
              ) : currentEvents.length === 0 ? (
                <div className="text-center text-2xl font-bold text-gray-700">
                  No events found matching your search.
                </div>
              ) : (
                currentEvents.map((item) => {
                  const hasDiscount =
                    getActiveDiscount(item.event_id) !== undefined;
                  const price = hasDiscount
                    ? item.discounted_price
                    : item.price;
                  const isCompleted = new Date(item.date) < new Date();
                  return (
                    <CardEvents
                      key={item.event_id}
                      eventId={item.event_id}
                      event_title={item.event_title}
                      imageUrl={item.image_url}
                      date={String(item.date)}
                      price={price}
                      hasDiscount={hasDiscount}
                      is_free={item.is_free}
                      location={item.location}
                      isCompleted={isCompleted}
                      onDetail={() => handleNavigate(item.event_id)}
                    />
                  );
                })
              )}
            </div>

            {/* pagination */}
            <div className="mt-4 flex justify-center space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`transform rounded-lg border-4 border-black bg-yellow-300 px-6 py-2 font-bold 
                text-black shadow-[4px_4px_0px_#000000] transition-transform hover:scale-105 
                active:scale-95 disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none`}
              >
                Previous
              </button>
              <span className="border-4 border-black bg-white px-4 py-2 text-lg font-extrabold text-black shadow-[4px_4px_0px_#000000]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`transform rounded-lg border-4 border-black bg-yellow-300 px-6 py-2 font-bold 
                text-black shadow-[4px_4px_0px_#000000] transition-transform hover:scale-105 
                active:scale-95 disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none`}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Registrations table */}
        <div className="w-full px-5">
          {isLoggedIn ? (
            <>
              <h2 className="mb-4 text-2xl font-bold text-black">
                Your Registrations
              </h2>
              {regisLoadingRef.current ? (
                // Show loading message while registration data is being fetched
                <LoadingSpinner />
              ) : registrations.length > 0 ? (
                // Show the registrations table when data is loaded and has entries
                <div className="flex items-center justify-center">
                  <div className="grid w-full grid-cols-1 place-items-center gap-4 lg:grid-cols-2">
                    {registrations.map((registration) => (
                      <MyRegis
                        key={registration.registration_id}
                        registration={registration}
                        onPay={handlePayment}
                        onAttend={handleAttend}
                        onReview={handleReview}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                // Show message if no registrations are found after loading
                <p className="text-lg text-gray-600">No Active Registrations</p>
              )}
            </>
          ) : (
            // Show message if the user is not logged in
            <p className="text-center text-2xl font-bold text-gray-600">
              Please log in to view your registrations.
            </p>
          )}
        </div>
      </div>
      <MyFooter />
    </div>
  );
}

export default Page;