import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../https";
import { enqueueSnackbar } from "notistack";
import { MdEdit, MdDelete } from "react-icons/md";

const Categories = () => {
  const queryClient = useQueryClient();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [editingCategory, setEditingCategory] = useState(null); // { _id, name, description }

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      enqueueSnackbar("Category created!", { variant: "success" });
      queryClient.invalidateQueries(["categories"]);
      setNewCategoryName("");
      setNewCategoryDesc("");
    },
    onError: () => enqueueSnackbar("Error creating category", { variant: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      enqueueSnackbar("Category updated!", { variant: "success" });
      queryClient.invalidateQueries(["categories"]);
      setEditingCategory(null);
    },
    onError: () => enqueueSnackbar("Error updating category", { variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      enqueueSnackbar("Category deleted!", { variant: "success" });
      queryClient.invalidateQueries(["categories"]);
    },
    onError: () => enqueueSnackbar("Error deleting category", { variant: "error" }),
  });

  const handleAddCategory = (e) => {
    e.preventDefault();
    createMutation.mutate({ name: newCategoryName, description: newCategoryDesc });
  };
  
  const handleUpdateCategory = () => {
    if (!editingCategory) return;
    updateMutation.mutate({ categoryId: editingCategory._id, name: editingCategory.name, description: editingCategory.description });
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-4">Manage Categories</h3>
      
      {/* Add Category Form */}
      <form onSubmit={handleAddCategory} className="mb-6 bg-[#1f1f1f] p-4 rounded-lg">
        <h4 className="text-lg font-medium text-white mb-2">Add New Category</h4>
        <div className="flex gap-4">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category Name"
            className="flex-grow bg-[#333] text-white p-2 rounded-lg focus:outline-none"
            required
          />
          <input
            type="text"
            value={newCategoryDesc}
            onChange={(e) => setNewCategoryDesc(e.target.value)}
            placeholder="Description (Optional)"
            className="flex-grow bg-[#333] text-white p-2 rounded-lg focus:outline-none"
          />
          <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg">
            Add
          </button>
        </div>
      </form>

      {/* Categories List */}
      <div className="space-y-3">
        {isLoading && <p className="text-white">Loading categories...</p>}
        {categories?.data?.data?.map((cat) => (
          <div key={cat._id} className="bg-[#1f1f1f] p-3 rounded-lg flex justify-between items-center">
             {editingCategory?._id === cat._id ? (
              <div className="flex-grow flex gap-4">
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="flex-grow bg-[#333] text-white p-2 rounded-lg focus:outline-none"
                />
                <input
                  type="text"
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="flex-grow bg-[#333] text-white p-2 rounded-lg focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <p className="text-white font-semibold">{cat.name}</p>
                <p className="text-sm text-[#ababab]">{cat.description}</p>
              </div>
            )}
            <div className="flex items-center gap-4">
              {editingCategory?._id === cat._id ? (
                <>
                  <button onClick={handleUpdateCategory} className="text-green-500 hover:text-green-400">Save</button>
                  <button onClick={() => setEditingCategory(null)} className="text-red-500 hover:text-red-400">Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => setEditingCategory(cat)} className="text-blue-500 hover:text-blue-400">
                    <MdEdit size={20} />
                  </button>
                  <button onClick={() => deleteMutation.mutate(cat._id)} className="text-red-500 hover:text-red-400">
                    <MdDelete size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
