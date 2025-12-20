import React, { useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders, updateOrderStatus } from "../../https";
import { formatDateAndTime } from "../../utils";
import useSocket from "../../hooks/useSocket";

const RecentOrders = () => {
  const queryClient = useQueryClient();
  const socket = useSocket(import.meta.env.VITE_BACKEND_URL);

  /* ------------------ SOCKET.IO EVENT HANDLING ------------------ */
  useEffect(() => {
    if (!socket) return;

    const handleOrderCreated = (newOrder) => {
      queryClient.setQueryData(["orders"], (prevData) => {
        if (!prevData) return { data: { data: [newOrder] } };
        return {
          ...prevData,
          data: {
            ...prevData.data,
            data: [newOrder, ...prevData.data.data],
          },
        };
      });

      enqueueSnackbar("New order received!", { variant: "info" });
    };

    const handleOrderUpdated = (updatedOrder) => {
      queryClient.setQueryData(["orders"], (prevData) => {
        if (!prevData) return prevData;

        const updatedOrders = prevData.data.data.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        );

        return {
          ...prevData,
          data: {
            ...prevData.data,
            data: updatedOrders,
          },
        };
      });

      enqueueSnackbar("Order status updated!", { variant: "info" });
    };

    socket.on("orderCreated", handleOrderCreated);
    socket.on("orderUpdated", handleOrderUpdated);

    return () => {
      socket.off("orderCreated", handleOrderCreated);
      socket.off("orderUpdated", handleOrderUpdated);
    };
  }, [socket, queryClient]);

  /* ------------------ ORDER STATUS UPDATE ------------------ */
  const orderStatusUpdateMutation = useMutation({
    mutationFn: ({ orderId, orderStatus }) =>
      updateOrderStatus({ orderId, orderStatus }),
    onSuccess: () => {
      enqueueSnackbar("Order status updated successfully!", {
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => {
      enqueueSnackbar("Failed to update order status!", {
        variant: "error",
      });
    },
  });

  const handleStatusChange = ({ orderId, orderStatus }) => {
    orderStatusUpdateMutation.mutate({ orderId, orderStatus });
  };

  /* ------------------ FETCH ORDERS ------------------ */
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

  /* ------------------ STATES ------------------ */
  if (isLoading) {
    return (
      <div className="text-white p-4 bg-[#262626] rounded-lg">
        Loading recent orders...
      </div>
    );
  }

  if (isError) {
    enqueueSnackbar("Something went wrong!", { variant: "error" });
    return null;
  }

  /* ------------------ UI ------------------ */
  return (
    <div className="container mx-auto bg-[#262626] p-4 rounded-lg">
      <h2 className="text-[#f5f5f5] text-xl font-semibold mb-4">
        Recent Orders
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[#f5f5f5]">
          <thead className="bg-[#333] text-[#ababab]">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date & Time</th>
              <th className="p-3">Items</th>
              <th className="p-3">Table No</th>
              <th className="p-3">Total</th>
              <th className="p-3 text-center">Payment Method</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-4 text-[#ababab]">
                  No recent orders found
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
                    {order?.customerDetails?.name ?? "N/A"}
                  </td>

                  <td className="p-4">
                    <select
                      className="bg-[#1a1a1a] border border-gray-500 p-2 rounded-lg"
                      value={order.orderStatus}
                      onChange={(e) =>
                        handleStatusChange({
                          orderId: order._id,
                          orderStatus: e.target.value,
                        })
                      }
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Ready">Ready</option>
                    </select>
                  </td>

                  <td className="p-4">
                    {formatDateAndTime(order.orderDate)}
                  </td>

                  <td className="p-4">
                    {order?.items?.length ?? 0} Items
                  </td>

                  <td className="p-4">
                    Table - {order?.table?.tableNo ?? "N/A"}
                  </td>

                  <td className="p-4">
                    ₹{order?.bills?.totalWithTax ?? 0}
                  </td>

                  <td className="p-4 text-center">
                    {order?.paymentMethod ?? "N/A"}
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

export default RecentOrders;
