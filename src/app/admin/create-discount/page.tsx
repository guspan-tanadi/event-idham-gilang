import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import flatpickr from "flatpickr";
import Swal from "sweetalert2";
import { discountSchema } from "@/utils/schema";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
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

type Errors = Record<string, string[]>;

function Page() {
  const router = useRouter();

  const [selectedOption, setSelectedOption] = useState<number | "">("");
//  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);
  const [, setEvents] = useState<Event[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState<number | "">("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [, setErrors] = useState<Errors>({});
  const [, setIsLoggedIn] = useState<boolean>(false);
  const [, setTokenPayload] = useState<TokenPayload | null>(null);

  const startDateInputRef = useRef<HTMLInputElement>(null);
  const endDateInputRef = useRef<HTMLInputElement>(null);

  const startDatePickerRef = useRef<flatpickr.Instance | null>(null);
  const endDatePickerRef = useRef<flatpickr.Instance | null>(null);

  const getAllEvents = async () => {
    try {
      const token = Cookies.get("access_token");
      const response = await axios.get("/api/admin/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents(response.data.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  async (e: React.FormEvent) => {
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
      const errorMap: Errors = {
        event_id: fieldErrors.event_id?._errors || [],
        discount_percentage: fieldErrors.discount_percentage?._errors || [],
        start_date: fieldErrors.start_date?._errors || [],
        end_date: fieldErrors.end_date?._errors || [],
      };
      setErrors(errorMap);
      return;
    }

    setErrors({});

    try {
      await axios.post("api/admin/discounts", discount, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
    if (startDateInputRef.current) {
      startDatePickerRef.current = flatpickr(startDateInputRef.current, {
        dateFormat: "Y-m-d",
        onChange: (selectedDates) => {
          setStartDate(selectedDates[0]);
        },
      });
    }

    if (endDateInputRef.current) {
      endDatePickerRef.current = flatpickr(endDateInputRef.current, {
        dateFormat: "Y-m-d",
        onChange: (selectedDates) => {
          setEndDate(selectedDates[0]);
        },
      });
    }
    return () => {
      startDatePickerRef.current?.destroy();
      endDatePickerRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    endDatePickerRef.current?.set("minDate", startDate || null);
  }, [startDate]);

  useEffect(() => {
    startDatePickerRef.current?.set("maxDate", endDate || null);
  }, [endDate]);

  useEffect(() => {
    getAllEvents();
  }, []);

  const checkLoginStatus = () => {
    const accessToken = Cookies.get("access_token");
    setIsLoggedIn(!!accessToken);

    if (accessToken) {
      try {
        const decodedToken: TokenPayload = jwtDecode(accessToken);
        if (decodedToken.role === "USER") {
          router.push("/?redirected=true");
        } else {
          setTokenPayload({
            id: decodedToken.id,
            role: decodedToken.role,
          });
        }
      } catch (error) {
        console.error("Invalid token or decoding error:", error);
        setTokenPayload(null);
      }
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Create Discount"></Breadcrumb>
      <div className="grid grid-cols-1">
        {/* Form JSX */}
      </div>
    </DefaultLayout>
  );
}

export default Page;