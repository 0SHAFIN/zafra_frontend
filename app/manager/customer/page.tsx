"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Customer {
  id: string;
  fullName: string;
  phone: number;
  email: string;
  address: string;
}

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/customer/get-all");
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white shadow-md rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">All Customers</h1>

      {customers.length === 0 ? (
        <p className="text-center text-gray-500">No customers found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.slice(0, 4).map((customer) => (
            <div
              key={customer.id}
              className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{customer.fullName}</h2>
              <p className="text-gray-600"><span className="font-medium">Phone:</span> {customer.phone}</p>
              <p className="text-gray-600"><span className="font-medium">Email:</span> {customer.email}</p>
              <p className="text-gray-600"><span className="font-medium">Address:</span> {customer.address}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
