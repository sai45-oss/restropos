import React, { useEffect } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders } from "../../https";
import { formatDateAndTime } from "../../utils";
import useSocket from "../../hooks/useSocket";

const Payments = () => {
  const queryClient = useQueryClient();
  const socket = useSocket(import.meta.env.VITE_BACKEND_URL);

  // Real-time updates for orders
  useEffect(() => {
    if (socket) {
      const handleOrderCreatedOrUpdated = (orderData) => {
        queryClient.invalidateQueries(["orders"]);
        // Or more optimistically:
        // queryClient.setQueryData(['orders'], (prevData) => { ... });
      };

      socket.on("orderCreated", handleOrderCreatedOrUpdated);
      socket.on("orderUpdated", handleOrderCreatedOrUpdated);

      return () => {
        socket.off("orderCreated", handleOrderCreatedOrUpdated);
        socket.off("orderUpdated", handleOrderCreatedOrUpdated);
      };
    }
  }, [socket, queryClient]);

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    placeholderData: keepPreviousData,
  });

  const orders = response?.data?.data ?? [];

  if (isLoading) {
    return (
      <div className="text-white p-4 bg-[#262626] rounded-lg container mx-auto">
        Loading payment data...
      </div>
    );
  }

  if (isError) {
    enqueueSnackbar("Something went wrong while fetching payments!", { variant: "error" });
    return null;
  }

  return (
    <div className="container mx-auto bg-[#262626] p-4 rounded-lg">
      <h2 className="text-[#f5f5f5] text-xl font-semibold mb-4">
        Payment History
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[#f5f5f5]">
          <thead className="bg-[#333] text-[#ababab]">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Date</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Payment Method</th>
              <th className="p-3">Subtotal</th>
              <th className="p-3">Tax</th>
              <th className="p-3">Total Amount</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-4 text-[#ababab]">
                  No payment records found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-gray-600 hover:bg-[#333]"
                >
                  <td className="p-4">
                    #{new Date(order.orderDate).getTime()}
                  </td>
                  <td className="p-4">
                    {formatDateAndTime(order.orderDate)}
                  </td>
                  <td className="p-4">
                    {order?.customerDetails?.name ?? "N/A"}
                  </td>
                  <td className="p-4 text-center">
                    {order?.paymentMethod ?? "N/A"}
                  </td>
                   <td className="p-4">
                    ₹{order?.bills?.total ?? 0}
                  </td>
                  <td className="p-4">
                    ₹{order?.bills?.tax ?? 0}
                  </td>
                  <td className="p-4 font-bold">
                    ₹{order?.bills?.totalWithTax ?? 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
