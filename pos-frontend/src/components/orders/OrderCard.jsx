import React from "react";
import { FaCheckDouble, FaLongArrowAltRight, FaCircle } from "react-icons/fa";
import { formatDateAndTime, getAvatarName } from "../../utils";

const OrderCard = ({ order, onUpdateStatus }) => {
  if (!order) return null;

  const getNextStatus = () => {
    if (order.orderStatus === "In Progress") return "Ready";
    if (order.orderStatus === "Ready") return "Completed";
    return null;
  };

  const nextStatus = getNextStatus();

  return (
    <div className="w-full bg-[#262626] p-4 rounded-lg mb-4">
      <div className="flex items-center gap-5">
        <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg">
          {getAvatarName(order?.customerDetails?.name)}
        </button>

        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#f5f5f5] text-lg font-semibold">
              {order?.customerDetails?.name || "N/A"}
            </h1>

            <p className="text-[#ababab] text-sm">
              #{new Date(order.orderDate).getTime()} / Dine in
            </p>

            <p className="text-[#ababab] text-sm">
              Table <FaLongArrowAltRight className="ml-2 inline" />
              {order?.table?.tableNo ?? "N/A"}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {order.orderStatus === "Ready" ? (
              <>
                <p className="text-green-600 bg-[#2e4a40] px-2 py-1 rounded-lg">
                  <FaCheckDouble className="inline mr-2" />
                  Ready
                </p>
                <p className="text-[#ababab] text-sm">
                  <FaCircle className="inline mr-2 text-green-600" />
                  Ready to serve
                </p>
              </>
            ) : order.orderStatus === "In Progress" ? (
              <>
                <p className="text-yellow-600 bg-[#4a452e] px-2 py-1 rounded-lg">
                  <FaCircle className="inline mr-2" />
                  {order.orderStatus}
                </p>
                <p className="text-[#ababab] text-sm">
                  <FaCircle className="inline mr-2 text-yellow-600" />
                  Preparing your order
                </p>
              </>
            ) : (
              <>
                <p className="text-blue-600 bg-[#2e404a] px-2 py-1 rounded-lg">
                  <FaCheckDouble className="inline mr-2" />
                  {order.orderStatus}
                </p>
                <p className="text-[#ababab] text-sm">
                  <FaCircle className="inline mr-2 text-blue-600" />
                  Order completed
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-4 text-[#ababab]">
        <p>{formatDateAndTime(order.orderDate)}</p>
        <p>{order.items?.length ?? 0} Items</p>
      </div>

      <hr className="mt-4 border-gray-500" />

      <div className="flex justify-between items-center mt-4">
        <h1 className="text-[#f5f5f5] text-lg font-semibold">Total</h1>
        <p className="text-[#f5f5f5] text-lg font-semibold">
          ₹{order?.bills?.totalWithTax?.toFixed(2) ?? "0.00"}
        </p>
        {nextStatus && (
          <button
            onClick={() => onUpdateStatus(order._id, nextStatus)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Mark as {nextStatus}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
