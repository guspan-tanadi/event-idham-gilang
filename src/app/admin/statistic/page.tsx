"use client"

import React, { useEffect, useState } from 'react';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import dynamic from 'next/dynamic';
import Cookies from 'js-cookie';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
);

type TokenPayload = {
  id: number;
  role: string;
};

function StatsPage() {
  const [viewType, setViewType] = useState('Monthly'); // 'Monthly' or 'Yearly'
  const [selectedYear, setSelectedYear] = useState(2024); // Default year for 'Yearly' view
  const [revenueData, setRevenueData] = useState<number[]>(Array(12).fill(0));
  const [, setIsLoggedIn] = useState(false);
  const [, setTokenPayload] = useState<TokenPayload | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = Cookies.get("access_token");
      try {
        const response = await axios.get('api/admin/stats/payments', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = response.data.data;

        if (viewType === 'Monthly') {
          // Calculate monthly revenue
          const revenueByMonth = Array(12).fill(0);
          data.forEach((payment: any) => {
            if (payment.payment_status === 'COMPLETED' && payment.payment_date) {
              const paymentDate = new Date(payment.payment_date);
              const month = paymentDate.getUTCMonth();
              const amount = parseFloat(payment.amount);
              if (!isNaN(amount)) {
                revenueByMonth[month] += amount;
              }
            }
          });
          setRevenueData(revenueByMonth);
        } else if (viewType === 'Yearly') {
          // Calculate yearly revenue for the selected year
          const revenueByMonth = Array(12).fill(0);
          data.forEach((payment: any) => {
            if (payment.payment_status === 'COMPLETED' && payment.payment_date) {
              const paymentDate = new Date(payment.payment_date);
              const year = paymentDate.getUTCFullYear();
              const month = paymentDate.getUTCMonth();
              const amount = parseFloat(payment.amount);
              if (!isNaN(amount) && year === selectedYear) {
                revenueByMonth[month] += amount;
              }
            }
          });
          setRevenueData(revenueByMonth);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [viewType, selectedYear]);

  const chartData = {
    labels: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ],
    datasets: [
      {
        label: 'Revenue',
        data: revenueData,
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
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
      <Breadcrumb pageName="Statistic" />
      <div className="bg-white h-full w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Revenue Statistics</h1>
          <div className="flex items-center space-x-4">
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
              className="border border-gray-300 rounded-md p-2"
            >
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
            {viewType === 'Yearly' && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md p-2"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
                <option value={2028}>2028</option>
              </select>
            )}
          </div>
        </div>
        <div className="w-full h-96">
          <Line data={chartData} />
        </div>
      </div>
    </DefaultLayout>
  );
}

export default StatsPage;