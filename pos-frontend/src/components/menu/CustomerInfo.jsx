import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAvatarName } from "../../utils";
import { setCustomer } from "../../redux/slices/customerSlice";
import { FaCheck, FaEdit } from "react-icons/fa";

const CustomerInfo = () => {
  const dispatch = useDispatch();
  const customerData = useSelector((state) => state.customer);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    guests: "",
  });

  useEffect(() => {
    if (customerData.isNewOrder && !customerData.customerName && customerData.table) {
      setIsEditing(true);
    } else {
      setFormData({
        name: customerData.customerName || "",
        phone: customerData.customerPhone || "",
        guests: customerData.guests || "",
      });
      setIsEditing(false);
    }
  }, [customerData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveCustomer = () => {
    if (formData.name && formData.phone && formData.guests) {
      dispatch(setCustomer(formData));
      setIsEditing(false);
    }
  };
  
  if (!customerData.table) {
      return (
          <div className="px-4 py-3">
              <h3 className="text-md text-gray-500 font-semibold tracking-wide">Select a table to begin</h3>
          </div>
      )
  }

  if (isEditing) {
    return (
      <div className="px-4 py-3">
        <h3 className="text-md text-[#f5f5f5] font-semibold tracking-wide mb-3">
          Enter Customer Details
        </h3>
        <div className="space-y-3">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Customer Name"
            className="w-full bg-[#1f1f1f] text-white p-2 rounded-lg focus:outline-none"
            required
          />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Customer Phone"
            className="w-full bg-[#1f1f1f] text-white p-2 rounded-lg focus:outline-none"
            required
          />
          <input
            type="number"
            name="guests"
            value={formData.guests}
            onChange={handleInputChange}
            placeholder="Number of Guests"
            className="w-full bg-[#1f1f1f] text-white p-2 rounded-lg focus:outline-none"
            required
          />
        </div>
        <button
          onClick={handleSaveCustomer}
          className="w-full mt-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2"
        >
          <FaCheck /> Save Customer
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-between px-4 py-3 cursor-pointer"
      onClick={() => setIsEditing(true)}
    >
      <div className="flex flex-col items-start">
        <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide">
          {customerData.customerName}
        </h1>
        <p className="text-xs text-[#ababab] font-medium mt-1">
          {customerData.customerPhone}
        </p>
        <p className="text-xs text-[#ababab] font-medium mt-1">
          Guests: {customerData.guests}
        </p>
      </div>
      <div className="flex items-center gap-3">
          <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg">
            {getAvatarName(customerData.customerName)}
          </button>
          <FaEdit className="text-gray-400"/>
      </div>
    </div>
  );
};

export default CustomerInfo;