import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addTable, addMenuItem, updateMenuItem, getCategories } from "../../https";
import { enqueueSnackbar } from "notistack";

const Modal = ({
  type = "table",
  onClose,
  editingData,
}) => {
  const queryClient = useQueryClient();

  // Unified state for all form data
  const [formData, setFormData] = useState({
    // Dish
    name: "",
    price: "",
    category: "",
    description: "",
    available: true,
    // Table
    tableNo: "",
    seats: "",
  });

  // Fetch categories for the dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    enabled: type === "dishes", // Only fetch if the modal is for dishes
  });

  useEffect(() => {
    if (editingData) {
      setFormData({
        name: editingData.name || "",
        price: editingData.price || "",
        category: editingData.category?._id || "",
        description: editingData.description || "",
        available: editingData.available !== undefined ? editingData.available : true,
        tableNo: editingData.tableNo || "",
        seats: editingData.seats || "",
      });
    }
  }, [editingData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  
  // Mutations
  const addMenuItemMutation = useMutation({
    mutationFn: addMenuItem,
    onSuccess: () => {
      enqueueSnackbar("Menu item added!", { variant: "success" });
      queryClient.invalidateQueries(["menuItems"]);
      onClose();
    },
    onError: () => enqueueSnackbar("Error adding menu item", { variant: "error" }),
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: updateMenuItem,
    onSuccess: () => {
      enqueueSnackbar("Menu item updated!", { variant: "success" });
      queryClient.invalidateQueries(["menuItems"]);
      onClose();
    },
    onError: () => enqueueSnackbar("Error updating menu item", { variant: "error" }),
  });
  
  const tableMutation = useMutation({
    mutationFn: addTable,
    onSuccess: () => {
        enqueueSnackbar("Table added successfully", { variant: "success" });
        queryClient.invalidateQueries(["tables"]);
        onClose();
    },
    onError: () => enqueueSnackbar("Error adding table", { variant: "error" }),
  })


  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === "dishes") {
      const { name, price, category, description, available } = formData;
      const mutationData = { name, price, category, description, available };
      if (editingData) {
        updateMenuItemMutation.mutate({ menuId: editingData._id, ...mutationData });
      } else {
        addMenuItemMutation.mutate(mutationData);
      }
    } else if (type === "table") {
      tableMutation.mutate({ tableNo: formData.tableNo, seats: formData.seats });
    }
  };

  const title =
    type === "dishes"
      ? editingData
        ? "Edit Menu Item"
        : "Add Menu Item"
      : "Add Table";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-[#262626] p-6 rounded-lg shadow-lg w-96"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#f5f5f5] text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#f5f5f5] hover:text-red-500"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {type === "dishes" && (
            <>
              <div>
                <label className="block text-[#ababab] mb-1 text-sm">Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Dish Name"
                  required
                  className="w-full bg-[#1f1f1f] text-white p-2 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#ababab] mb-1 text-sm">Price</label>
                <input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Price"
                  required
                  className="w-full bg-[#1f1f1f] text-white p-2 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#ababab] mb-1 text-sm">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#1f1f1f] text-white p-2 rounded-lg focus:outline-none"
                >
                  <option value="">Select Category</option>
                  {categoriesData?.data?.data?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#ababab] mb-1 text-sm">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description"
                  rows="3"
                  className="w-full bg-[#1f1f1f] text-white p-2 rounded-lg focus:outline-none"
                />
              </div>
              <div className="flex items-center">
                <input
                  id="available-checkbox"
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                />
                <label
                  htmlFor="available-checkbox"
                  className="ml-2 text-sm font-medium text-gray-300"
                >
                  Available
                </label>
              </div>
            </>
          )}

          {type === "table" && (
             <>
             <div>
               <label className="block text-[#ababab] mb-1 text-sm">Table Number</label>
               <input
                 name="tableNo"
                 type="number"
                 value={formData.tableNo}
                 onChange={handleInputChange}
                 placeholder="Table Number"
                 required
                 className="w-full bg-[#1f1f1f] text-white p-2 rounded-lg focus:outline-none"
               />
             </div>
             <div>
               <label className="block text-[#ababab] mb-1 text-sm">Number of Seats</label>
               <input
                 name="seats"
                 type="number"
                 value={formData.seats}
                 onChange={handleInputChange}
                 placeholder="Number of Seats"
                 required
                 className="w-full bg-[#1f1f1f] text-white p-2 rounded-lg focus:outline-none"
               />
             </div>
           </>
          )}

          <button
            type="submit"
            className="w-full rounded-lg mt-6 py-3 text-lg bg-orange-500 hover:bg-orange-600 text-white font-bold"
          >
            {editingData ? "Update" : "Add"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Modal;
