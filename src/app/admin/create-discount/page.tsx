"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import flatpickr from "flatpickr";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { discountSchema } from "@/utils/schema";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";

type TokenPayload = {
  id: number;
  role: string;
};

type Event = {
  event_id: number;
  event_title: string;
  is_free: boolean;
  price: number;
  discounted_price: number;
};

type Discount = {
  event_id: number;
  discount_percentage: number | "";
  start_date: string;
  end_date: string;
};

function Page() {
  const router = useRouter();

  const [selectedOption, setSelectedOption] = useState<number | "">("");
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState<number | "">("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [, setIsLoggedIn] = useState(false);
  const [, setTokenPayload] = useState<TokenPayload | null>(null);

  // Refs for input elements
  const startDateInputRef = useRef<HTMLInputElement>(null);
  const endDateInputRef = useRef<HTMLInputElement>(null);

  // Refs for flatpickr instances
  const startDatePickerRef = useRef<flatpickr.Instance | null>(null);
  const endDatePickerRef = useRef<flatpickr.Instance | null>(null);

  async function getAllEvents() {
    try {
      const token = Cookies.get("access_token");
      console.log()
      const response = await axios.get("/api/admin/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents(response.data.data);
    } catch (error) {
      console.log(error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = Cookies.get("access_token");
    const discount: Discount = {
      event_id: Number(selectedOption),
      discount_percentage: discountPercentage,
      start_date: startDate ? startDate.toISOString() : "",
      end_date: endDate ? endDate.toISOString() : "",
    };

    const validateResult = discountSchema.safeParse(discount);
    if (!validateResult.success) {
      const fieldErrors = validateResult.error.format();
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    try {
      const response = await axios.post("api/admin/discounts", discount, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Discount posted successfully:", response.data);
      Swal.fire({
        title: "Success!",
        text: "The discount has been posted successfully.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        router.push("/admin");
      });
    } catch (error) {
      Swal.fire("Error!", "There was an error creating the discount.", "error");
      console.error("Error posting discount:", error);
    }
  };

  useEffect(() => {
    // Initialize flatpickr for start date
    if (startDateInputRef.current) {
      startDatePickerRef.current = flatpickr(startDateInputRef.current, {
        dateFormat: "Y-m-d",
        onChange: (selectedDates) => {
          setStartDate(selectedDates[0]); // Set start date as Date object
        },
      });
    }

    // Initialize flatpickr for end date
    if (endDateInputRef.current) {
      endDatePickerRef.current = flatpickr(endDateInputRef.current, {
        dateFormat: "Y-m-d",
        onChange: (selectedDates) => {
          setEndDate(selectedDates[0]); // Set end date as Date object
        },
      });
    }

    // Cleanup function to destroy flatpickr instances on unmount
    return () => {
      if (startDatePickerRef.current) {
        startDatePickerRef.current.destroy();
      }
      if (endDatePickerRef.current) {
        endDatePickerRef.current.destroy();
      }
    };
  }, []);

  // Update minDate of end date picker when start date changes
  useEffect(() => {
    if (endDatePickerRef.current) {
      endDatePickerRef.current.set("minDate", startDate || null);
    }
  }, [startDate]);

  // Optional: Update maxDate of start date picker when end date changes
  useEffect(() => {
    if (startDatePickerRef.current) {
      startDatePickerRef.current.set("maxDate", endDate || null);
    }
  }, [endDate]);

  useEffect(() => {
    getAllEvents();
  }, []);

  const changeTextColor = () => {
    setIsOptionSelected(true);
  };

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
      <Breadcrumb pageName="Create Discount"></Breadcrumb>
      <div className="grid grid-cols-1">
        <div className="flex flex-col gap-9">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Discount Event Form
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6.5">
                <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                  <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Events
                    </label>
                    <div className="relative z-20 bg-transparent dark:bg-form-input">
                      <select
                        value={selectedOption}
                        onChange={(e) => {
                          setSelectedOption(Number(e.target.value));
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
                          Select the event
                        </option>
                        {events
                          .filter(
                            (item) =>
                              item.price > 0 && item.discounted_price <= 0,
                          )
                          .map((item) => (
                            <option
                              key={item.event_id}
                              value={item.event_id}
                              className="text-body dark:text-bodydark"
                            >
                              {item.event_title}
                            </option>
                          ))}
                      </select>
                      {errors.event_id && (
                        <span className="text-sm text-red-500">
                          {errors.event_id._errors[0]}
                        </span>
                      )}
                      <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2">
                        {/* SVG Icon */}
                      </span>
                    </div>
                  </div>
                  <div className="w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Discount Percentage
                    </label>
                    <input
                      onChange={(e) =>
                        setDiscountPercentage(Number(e.target.value))
                      }
                      value={discountPercentage}
                      type="number"
                      placeholder="Discount Percentage"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                    {errors.discount_percentage && (
                      <span className="text-sm text-red-500">
                        {errors.discount_percentage._errors[0]}
                      </span>
                    )}
                  </div>
                  <div className="w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Start Date
                    </label>
                    <div>
                      <div className="relative">
                        <input
                          ref={startDateInputRef}
                          className="start-datepicker w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                          placeholder="YYYY-MM-DD"
                        />

                        <div className="pointer-events-none absolute inset-0 left-auto right-5 flex items-center">
                          {/* Calendar Icon */}
                        </div>
                      </div>
                    </div>
                    {errors.start_date && (
                      <span className="text-sm text-red-500">
                        {errors.start_date._errors[0]}
                      </span>
                    )}
                  </div>
                  <div className="w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      End Date
                    </label>
                    <div>
                      <div className="relative">
                        <input
                          ref={endDateInputRef}
                          className="end-datepicker w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                          placeholder="YYYY-MM-DD"
                        />

                        <div className="pointer-events-none absolute inset-0 left-auto right-5 flex items-center">
                          {/* Calendar Icon */}
                        </div>
                      </div>
                    </div>
                    {errors.end_date && (
                      <span className="text-sm text-red-500">
                        {errors.end_date._errors[0]}
                      </span>
                    )}
                  </div>
                </div>
                <button className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

export default Page;