import React from "react";
import { useNavigate } from "react-router-dom";
import { getAvatarName, getBgColor } from "../../utils";
import { useDispatch } from "react-redux";
import { updateTable } from "../../redux/slices/customerSlice";
import { FaLongArrowAltRight } from "react-icons/fa";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const TableCard = ({ id, name, status, initials, seats, onEdit, onDelete }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleClick = (name) => {
    if (status === "Booked") return;

    const table = { tableId: id, tableNo: name };
    dispatch(updateTable({ table }));
    navigate(`/menu`);
  };

  return (
    <div
      onClick={() => handleClick(name)}
      className="w-full h-[280px] hover:bg-[#2c2c2c] bg-[#262626] p-4 rounded-lg cursor-pointer flex flex-col justify-between"
    >
      <div className="flex items-center justify-between px-1">
        <h1 className="text-[#f5f5f5] text-xl font-semibold">
          Table <FaLongArrowAltRight className="text-[#ababab] ml-2 inline" />{" "}
          {name}
        </h1>
        <p
          className={`${
            status === "Booked"
              ? "text-green-600 bg-[#2e4a40]"
              : "bg-[#664a04] text-white"
          } px-2 py-1 rounded-lg`}
        >
          {status}
        </p>
      </div>
      <div className="flex items-center justify-center">
        <h1
          className={`text-white rounded-full p-5 text-xl`}
          style={{ backgroundColor: initials ? getBgColor() : "#1f1f1f" }}
        >
          {getAvatarName(initials) || "N/A"}
        </h1>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-[#ababab] text-xs">
          Seats: <span className="text-[#f5f5f5]">{seats}</span>
        </p>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-blue-500 hover:text-blue-700"
          >
            <FiEdit size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (status !== "Booked") {
                onDelete();
              }
            }}
            className={`text-red-500 ${
              status === "Booked"
                ? "cursor-not-allowed"
                : "hover:text-red-700"
            }`}
            disabled={status === "Booked"}
          >
            <FiTrash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableCard;