import React, { useState, useEffect } from "react";
import Modal from "../shared/Modal";

const UpdateTableModal = ({ isOpen, onClose, table, onUpdate }) => {
  const [tableNo, setTableNo] = useState("");
  const [seats, setSeats] = useState("");

  useEffect(() => {
    if (table) {
      setTableNo(table.tableNo);
      setSeats(table.seats);
    }
  }, [table]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ tableId: table._id, tableNo, seats });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Table">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="tableNo"
            className="block text-sm font-medium text-gray-300"
          >
            Table Number
          </label>
          <input
            type="text"
            id="tableNo"
            value={tableNo}
            onChange={(e) => setTableNo(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="seats"
            className="block text-sm font-medium text-gray-300"
          >
            Seats
          </label>
          <input
            type="number"
            id="seats"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
          />
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Update
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateTableModal;
