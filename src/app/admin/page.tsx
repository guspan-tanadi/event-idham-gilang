"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Events, Users, Registrations, Payments } from "@/models/models";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

//import { Event } from "../../../../api/src/models/models";
import axios from "axios";
import Cookies from "js-cookie";
import React from "react";
import Swal from "sweetalert2";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_AXIOS_BASE_URL;

type TokenPayload = {
  id: number;
  role: string;
};

function AdminDashboard() {
  const [events, setEvents] = useState<Events[]>([]);
  const [users, setUsers] = useState<Users[]>([]);
  const [registrations, setRegistrations] = useState<Registrations[]>([]);
  const [payments, setPayments] = useState<Payments[]>([]);
  const [eventloading, setEventLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [registrationLoading, setRegisLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [, setIsLoggedIn] = useState(false);
  const [, setTokenPayload] = useState<TokenPayload | null>(null);

  const router = useRouter();

  async function getAllEvents() {
    setEventLoading(true);
    try {
      const token = Cookies.get("access_token");
      const response = await axios.get("api/admin/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setEventLoading(false);
    }
  }

  async function getAllUsers() {
    setUserLoading(true);
    try {
      const token = Cookies.get("access_token");
      const response = await axios.get("api/admin/stats/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setUserLoading(false);
    }
  }

  async function getAllRegistrations() {
    setRegisLoading(true);
    try {
      const token = Cookies.get("access_token");
      const response = await axios.get("api/admin/stats/registrations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRegistrations(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setRegisLoading(false);
    }
  }

  async function getAllPayments() {
    setPaymentLoading(true);
    try {
      const token = Cookies.get("access_token");
      const response = await axios.get("api/admin/stats/payments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPayments(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setPaymentLoading(false);
    }
  }

  async function deleteEvent(id: number) {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });
      if (result.isConfirmed) {
        const token = Cookies.get("access_token");
        await axios.delete(`api/admin/events/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.event_id !== id),
        );
        Swal.fire("Deleted!", "Your event has been deleted.", "success");
      }
      console.log("Event deleted");
    } catch (error) {
      Swal.fire("Error!", "There was an error deleting the event.", "error");
      console.log("Error deleting the event", error);
    }
  }

  const handleNavigate = (event_id: number) => {
    router.push(`/admin/update-event/${event_id}`);
  };

  useEffect(() => {
    getAllEvents();
    getAllUsers();
    getAllRegistrations();
    getAllPayments();
  }, []);

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
      <Breadcrumb pageName="Admin"></Breadcrumb>
      <div className="grid grid-cols-1 gap-5">
        {/* table events */}
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <h2 className="pb-3 text-title-md2 font-semibold text-black dark:text-white">
            Events
          </h2>
          {eventloading ? (
            <div className="flex items-center justify-center py-10">
              <p>Loading...</p>{" "}
              {/* Replace this with a spinner if you have one */}
            </div>
          ) : (
            <div className="max-h-[400px] w-full overflow-x-auto overflow-y-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="min-w-[200px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                      Title/Price
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      Date & Time
                    </th>
                    <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                      Category
                    </th>
                    <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                      location
                    </th>
                    <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                      Seat Qty
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((item, key) => (
                    <tr key={key}>
                      <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                        <h5 className="font-medium text-black dark:text-white">
                          {item.event_title}
                        </h5>
                        <p className="text-sm">
                          {Number(item.discounted_price) > 0
                            ? `Discount: ${new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                              }).format(item.discounted_price)}`
                            : `${new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                              }).format(item.price)}`}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm">
                          {new Date(item.time).toTimeString()}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {item.category}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {item.location}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {item.seat_quantity}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <div className="flex items-center space-x-3.5">
                          <button
                            className="hover:text-primary"
                            onClick={() => handleNavigate(item.event_id)}
                          >
                            <svg
                              className="fill-current"
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M8.99981 14.8219C3.43106 14.8219 0.674805 9.50624 0.562305 9.28124C0.47793 9.11249 0.47793 8.88749 0.562305 8.71874C0.674805 8.49374 3.43106 3.20624 8.99981 3.20624C14.5686 3.20624 17.3248 8.49374 17.4373 8.71874C17.5217 8.88749 17.5217 9.11249 17.4373 9.28124C17.3248 9.50624 14.5686 14.8219 8.99981 14.8219ZM1.85605 8.99999C2.4748 10.0406 4.89356 13.5562 8.99981 13.5562C13.1061 13.5562 15.5248 10.0406 16.1436 8.99999C15.5248 7.95936 13.1061 4.44374 8.99981 4.44374C4.89356 4.44374 2.4748 7.95936 1.85605 8.99999Z"
                                fill=""
                              />
                              <path
                                d="M9 11.3906C7.67812 11.3906 6.60938 10.3219 6.60938 9C6.60938 7.67813 7.67812 6.60938 9 6.60938C10.3219 6.60938 11.3906 7.67813 11.3906 9C11.3906 10.3219 10.3219 11.3906 9 11.3906ZM9 7.875C8.38125 7.875 7.875 8.38125 7.875 9C7.875 9.61875 8.38125 10.125 9 10.125C9.61875 10.125 10.125 9.61875 10.125 9C10.125 8.38125 9.61875 7.875 9 7.875Z"
                                fill=""
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteEvent(item.event_id)}
                            className="hover:text-primary"
                          >
                            <svg
                              className="fill-current"
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z"
                                fill=""
                              />
                              <path
                                d="M9.00039 9.11255C8.66289 9.11255 8.35352 9.3938 8.35352 9.75942V13.3313C8.35352 13.6688 8.63477 13.9782 9.00039 13.9782C9.33789 13.9782 9.64727 13.6969 9.64727 13.3313V9.75942C9.64727 9.3938 9.33789 9.11255 9.00039 9.11255Z"
                                fill=""
                              />
                              <path
                                d="M11.2502 9.67504C10.8846 9.64692 10.6033 9.90004 10.5752 10.2657L10.4064 12.7407C10.3783 13.0782 10.6314 13.3875 10.9971 13.4157C11.0252 13.4157 11.0252 13.4157 11.0533 13.4157C11.3908 13.4157 11.6721 13.1625 11.6721 12.825L11.8408 10.35C11.8408 9.98442 11.5877 9.70317 11.2502 9.67504Z"
                                fill=""
                              />
                              <path
                                d="M6.72245 9.67504C6.38495 9.70317 6.1037 10.0125 6.13182 10.35L6.3287 12.825C6.35683 13.1625 6.63808 13.4157 6.94745 13.4157C6.97558 13.4157 6.97558 13.4157 7.0037 13.4157C7.3412 13.3875 7.62245 13.0782 7.59433 12.7407L7.39745 10.2657C7.39745 9.90004 7.08808 9.64692 6.72245 9.67504Z"
                                fill=""
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* table users */}
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <h2 className="pb-3 text-title-md2 font-semibold text-black dark:text-white">
            Users
          </h2>
          {userLoading ? (
            <div className="flex items-center justify-center py-10">
              <p>Loading...</p>{" "}
              {/* Replace this with a spinner if you have one */}
            </div>
          ) : (
            <div className="max-h-[400px] w-full overflow-x-auto overflow-y-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                      User ID
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      Username
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      Fullname
                    </th>
                    <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                      Email
                    </th>
                    <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                      Role
                    </th>
                    <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item, key) => (
                    <tr key={key}>
                      <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                        <h5 className="font-medium text-black dark:text-white">
                          {item.user_id}
                        </h5>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <h5 className="font-medium text-black dark:text-white">
                          {item.username}
                        </h5>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {item.fullname}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {item.email}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {item.role}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* table registration */}
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <h2 className="pb-3 text-title-md2 font-semibold text-black dark:text-white">
            Registrations
          </h2>
          {registrationLoading ? (
            <div className="flex items-center justify-center py-10">
              <p>Loading...</p>{" "}
              {/* Replace this with a spinner if you have one */}
            </div>
          ) : (
            <div className="max-h-[400px] w-full overflow-x-auto overflow-y-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                      Registration ID
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      Email
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      Event Title
                    </th>
                    <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                      Seat Quantity
                    </th>
                    <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                      Registration Status
                    </th>
                    <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                      Registration Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((item, key) => (
                    <tr key={key}>
                      <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                        <h5 className="font-medium text-black dark:text-white">
                          {item.registration_id}
                        </h5>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <h5 className="font-medium text-black dark:text-white">
                          {item.User.email}
                        </h5>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {item.Event.event_title}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {item.quantity}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {item.registration_status}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {new Date(
                            item.registration_date,
                          ).toLocaleDateString()}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* table payments */}
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <h2 className="pb-3 text-title-md2 font-semibold text-black dark:text-white">
            Payments
          </h2>
          {paymentLoading ? (
            <div className="flex items-center justify-center py-10">
              <p>Loading...</p>{" "}
              {/* Replace this with a spinner if you have one */}
            </div>
          ) : (
            <div className="max-h-[400px] w-full overflow-x-auto overflow-y-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                      Payment ID
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      Registration ID
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      Email
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      Event Title
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      Amount
                    </th>
                    <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                      Payment Status
                    </th>
                    <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                      Payment Method
                    </th>
                    <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                      Payment Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((item, key) => (
                    <tr key={key}>
                      <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                        <h5 className="font-medium text-black dark:text-white">
                          {item.payment_id}
                        </h5>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <h5 className="font-medium text-black dark:text-white">
                          {item.registration_id}
                        </h5>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {item.Registration.User.email}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {item.Registration.Event.event_title}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {item.amount}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {item.payment_status}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {item.payment_method}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {new Date(item.payment_date).toLocaleDateString()}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}

export default AdminDashboard;
