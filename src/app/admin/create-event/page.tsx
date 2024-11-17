
"use client";
import flatpickr from "flatpickr";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { eventSchema } from "@/utils/schema";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React from "react";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";


type TokenPayload = {
  id: number;
  role: string;
};

function Page() {
  const router = useRouter();

  const [enabled, setEnabled] = useState<boolean>(false); // is_free
  const [eventTitle, setEventTitle] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<File | null>(null);
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("0.00");
  const [location, setLocation] = useState<string>("");
  const [seatQuantity, setSeatQuantity] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [, setIsLoggedIn] = useState(false);
  const [, setTokenPayload] = useState<TokenPayload | null>(null);

  const [errors, setErrors] = useState<any>({});

  const changeTextColor = () => {
    setIsOptionSelected(true);
  };

  useEffect(() => {
    // Initialize date picker for date
    flatpickr("#datePicker", {
      dateFormat: "Y-m-d",
      onChange: (selectedDates: Date[]) => {
        if (selectedDates && selectedDates.length > 0) {
          setDate(selectedDates[0]);
        }
      },
    });

    // Initialize time picker for time
    flatpickr("#timePicker", {
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      time_24hr: true,
      onChange: (selectedTimes: Date[]) => {
        if (selectedTimes && selectedTimes.length > 0) {
          setTime(selectedTimes[0]);
        }
      },
    });
  }, []);

  function padZero(num: number): string {
    return num.toString().padStart(2, "0");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const accessToken = Cookies.get("access_token");

    // Combine date and time into strings
    let dateTimeDate = null;
    let dateTimeTime = null;


    if (date && time) {
      const year = date.getFullYear();
      const month = padZero(date.getMonth() + 1); // Months are zero-indexed
      const day = padZero(date.getDate());
      const hours = padZero(time.getHours());
      const minutes = padZero(time.getMinutes());
      const seconds = padZero(time.getSeconds());
      dateTimeDate = `${year}-${month}-${day}T00:00:00Z`; // "YYYY-MM-DD"
      dateTimeTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`; // "HH:MM:SS"
    }

    const data = {
      event_title: eventTitle,
      description,
      category: selectedOption,
      price: enabled ? 0.0 : parseFloat(price),
      discounted_price: 0.0,
      is_free: enabled,
      date: dateTimeDate,
      time: dateTimeTime,
      location,
      seat_quantity: seatQuantity,
    };
    console.log("data" + data);
    const result = eventSchema.safeParse(data);

    if (!result.success) {
      const fieldErrors = result.error.format();
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    const formData = new FormData();
    formData.append("event_title", eventTitle);
    formData.append("description", description);
    formData.append("category", selectedOption);
    formData.append("price", enabled ? "0.0" : price);
    formData.append("discounted_price", "0.0");
    formData.append("is_free", enabled.toString());
    formData.append("date", dateTimeDate || "");
    formData.append("time", dateTimeTime || "");
    formData.append("location", location);
    formData.append("seat_quantity", seatQuantity.toString());

    if (imageUrl) {
      formData.append("image", imageUrl);
    }
    axios
      .post("/api/admin/events", formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        // handle success
        Swal.fire({
          title: "Success!",
          text: "The event has been created successfully.",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          router.push("/admin"); // Redirect after user clicks OK
        });
      })
      .catch((error) => {
        // handle error
        Swal.fire("Error!", "There was an error creating the event.", "error");
        console.error(error);
      });
  }

  useEffect(function checkLoginStatus() {
    const accessToken = Cookies.get("access_token");
    setIsLoggedIn(!!accessToken);
    if (accessToken) {
      try {
        const decodedToken: TokenPayload = jwtDecode(accessToken);
        console.log("user_id: ", decodedToken.id);
        console.log("role: ", decodedToken.role);
        if (decodedToken.role === "USER") {
          router.push("/?redirected=true")
        } else {
          setTokenPayload({
            id: decodedToken.id,
            role: decodedToken.role,
          });
        }
      } catch (error) {
        console.error("Invalid token or decoding error:", error); // Log any decoding errors
        setTokenPayload(null); // Ensure state is updated if there’s an error
      }
    }
  }, []);
  
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Create Event"></Breadcrumb>
      <div>
        <div className="w3/4 grid grid-cols-1">
          <div className="flex flex-col gap-9">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Create Events
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-5.5 p-6.5">
                    {/* Event Title Input */}
                    <div>
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        Event Title
                      </label>
                      <input
                        type="text"
                        placeholder="Event Title"
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                      {errors.event_title && (
                        <p className="text-sm text-red-500">
                          {errors.event_title._errors[0]}
                        </p>
                      )}
                    </div>

                    {/* Photo URL */}
                    <div>
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        Photo URL
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setImageUrl(e.target.files[0]);
                          }
                        }}
                        className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:px-5 file:py-3 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                      />
                    </div>

                    {/* Description */}
                    <div className="">
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        Description
                      </label>
                      <textarea
                        rows={6}
                        placeholder="Type your description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      ></textarea>
                      {errors.description && (
                        <p className="text-sm text-red-500">
                          {errors.description._errors[0]}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div>
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        disabled={enabled}
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:disabled:bg-black"
                      />
                      {errors.price && (
                        <p className="text-sm text-red-500">
                          {errors.price._errors[0]}
                        </p>
                      )}
                    </div>

                    {/* Seat Quantity */}
                    <div>
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        Seat Quantity
                      </label>
                      <input
                        type="number"
                        placeholder="Seat Quantity"
                        value={seatQuantity}
                        onChange={(e) =>
                          setSeatQuantity(parseInt(e.target.value))
                        }
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                      {errors.seat_quantity && (
                        <p className="text-sm text-red-500">
                          {errors.seat_quantity._errors[0]}
                        </p>
                      )}
                    </div>

                    {/* Is Free? */}
                    <label
                      htmlFor="toggle1"
                      className="flex cursor-pointer select-none items-center"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="toggle1"
                          className="sr-only"
                          onChange={() => {
                            setEnabled(!enabled);
                          }}
                        />
                        <div className="block h-8 w-14 rounded-full bg-meta-9 dark:bg-[#5A616B]"></div>
                        <div
                          className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition ${
                            enabled &&
                            "!right-1 !translate-x-full !bg-primary dark:!bg-white"
                          }`}
                        ></div>
                      </div>
                      <span className="ml-4 text-sm font-medium text-black dark:text-white">
                        Is Free?
                      </span>
                    </label>

                    {/* Location  */}
                    <div>
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                      {errors.location && (
                        <p className="text-sm text-red-500">
                          {errors.location._errors[0]}
                        </p>
                      )}
                    </div>

                    {/* Category */}
                    <div className="mb-4.5">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Category
                      </label>

                      <div className="relative z-20 bg-transparent dark:bg-form-input">
                        <select
                          value={selectedOption}
                          onChange={(e) => {
                            setSelectedOption(e.target.value);
                            changeTextColor();
                          }}
                          className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${
                            isOptionSelected ? "text-black dark:text-white" : ""
                          }`}
                        >
                          <option
                            value=""
                            disabled
                            className="text-body dark:text-bodydark"
                          >
                            Select your category
                          </option>
                          <option
                            value="MUSIC"
                            className="text-body dark:text-bodydark"
                          >
                            Music
                          </option>
                          <option
                            value="SPORTS"
                            className="text-body dark:text-bodydark"
                          >
                            Sport
                          </option>
                          <option
                            value="EDUCATION"
                            className="text-body dark:text-bodydark"
                          >
                            Education
                          </option>
                          <option
                            value="TECHNOLOGY"
                            className="text-body dark:text-bodydark"
                          >
                            Technology
                          </option>
                        </select>

                        <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2">
                          <svg
                            className="fill-current"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                fill=""
                              ></path>
                            </g>
                          </svg>
                        </span>
                      </div>
                      {errors.category && (
                        <p className="text-sm text-red-500">
                          {errors.category._errors[0]}
                        </p>
                      )}
                    </div>

                    {/* Date Picker */}
                    <div>
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        Date
                      </label>
                      <div className="relative">
                        <input
                          id="datePicker"
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                          placeholder="Select date"
                        />
                        <div className="pointer-events-none absolute inset-0 left-auto right-5 flex items-center">
                          {/* Calendar Icon */}
                        </div>
                      </div>
                      {errors.date && (
                        <p className="text-sm text-red-500">
                          {errors.date._errors[0]}
                        </p>
                      )}
                    </div>

                    {/* Time Picker */}
                    <div>
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        Time
                      </label>
                      <div className="relative">
                        <input
                          id="timePicker"
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                          placeholder="Select time"
                        />
                        <div className="pointer-events-none absolute inset-0 left-auto right-5 flex items-center">
                          {/* Clock Icon */}
                        </div>
                      </div>
                      {errors.time && (
                        <p className="text-sm text-red-500">
                          {errors.time._errors[0]}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                    >
                      Create Events
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

export default Page;