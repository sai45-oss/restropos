import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMenuItems, deleteMenuItem } from "../../https";
import { enqueueSnackbar } from "notistack";
import { MdEdit, MdDelete } from "react-icons/md";
import Modal from "./Modal"; // Reusing the existing modal

const MenuItems = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: menuItems, isLoading } = useQuery({
    queryKey: ["menuItems"],
    queryFn: getMenuItems,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      enqueueSnackbar("Menu Item deleted!", { variant: "success" });
      queryClient.invalidateQueries(["menuItems"]);
    },
    onError: () => enqueueSnackbar("Error deleting item", { variant: "error" }),
  });

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  }

  return (
    <div>
       <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Manage Menu Items</h3>
        <button onClick={handleAddNew} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg">
            Add New Item
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[#f5f5f5]">
          <thead className="bg-[#333] text-[#ababab]">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Available</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan="5" className="text-center p-4 text-white">Loading...</td></tr>}
            {menuItems?.data?.data?.map((item) => (
              <tr key={item._id} className="border-b border-gray-600 hover:bg-[#333]">
                <td className="p-4">{item.name}</td>
                <td className="p-4">{item.category?.name || 'N/A'}</td>
                <td className="p-4">₹{item.price}</td>
                <td className="p-4">{item.available ? "Yes" : "No"}</td>
                <td className="p-4 flex gap-4">
                  <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-400">
                    <MdEdit size={20} />
                  </button>
                  <button onClick={() => deleteMutation.mutate(item._id)} className="text-red-500 hover:text-red-400">
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <Modal 
          setIsDishesModalOpen={setIsModalOpen} // The modal uses this prop name
          type="dishes" 
          editingData={editingItem} 
        />
      )}
    </div>
  );
};

export default MenuItems;
