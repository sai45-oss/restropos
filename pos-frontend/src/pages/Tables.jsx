import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import TableCard from "../components/tables/TableCard";
import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getTables, updateTable, deleteTable } from "../https";
import { enqueueSnackbar } from "notistack";
import UpdateTableModal from "../components/tables/UpdateTableModal";

const Tables = () => {
  const [status, setStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "POS | Tables";
  }, []);

  const { data: resData, isError } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTable,
    onSuccess: () => {
      enqueueSnackbar("Table deleted successfully", { variant: "success" });
      queryClient.invalidateQueries(["tables"]);
    },
    onError: () => {
      enqueueSnackbar("Failed to delete table", { variant: "error" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTable,
    onSuccess: () => {
      enqueueSnackbar("Table updated successfully", { variant: "success" });
      queryClient.invalidateQueries(["tables"]);
    },
    onError: () => {
      enqueueSnackbar("Failed to update table", { variant: "error" });
    },
  });

  if (isError) {
    enqueueSnackbar("Something went wrong!", { variant: "error" });
  }

  const handleEditClick = (table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (tableId) => {
    deleteMutation.mutate(tableId);
  };

  const handleUpdate = (updatedData) => {
    updateMutation.mutate(updatedData);
    setIsModalOpen(false);
    setSelectedTable(null);
  };

  const filteredTables =
    resData?.data.data.filter((table) => {
      if (status === "all") return true;
      return table.status.toLowerCase() === status;
    }) || [];

  return (
    <section className="bg-[#1f1f1f] h-screen overflow-auto pb-20">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Tables
          </h1>
        </div>
        <div className="flex items-center justify-around gap-4">
          <button
            onClick={() => setStatus("all")}
            className={`text-[#ababab] text-lg ${
              status === "all" && "bg-[#383838] rounded-lg px-5 py-2"
            }  rounded-lg px-5 py-2 font-semibold`}
          >
            All
          </button>
          <button
            onClick={() => setStatus("booked")}
            className={`text-[#ababab] text-lg ${
              status === "booked" && "bg-[#383838] rounded-lg px-5 py-2"
            }  rounded-lg px-5 py-2 font-semibold`}
          >
            Booked
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-8 px-16 py-8 h-[650px] overflow-y-scroll scrollbar-hide">
        {filteredTables.map((table) => {
          return (
            <TableCard
              key={table._id}
              id={table._id}
              name={table.tableNo}
              status={table.status}
              initials={table?.currentOrder?.customerDetails.name}
              seats={table.seats}
              onEdit={() => handleEditClick(table)}
              onDelete={() => handleDeleteClick(table._id)}
            />
          );
        })}
      </div>

      <UpdateTableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        table={selectedTable}
        onUpdate={handleUpdate}
      />

      <BottomNav />
    </section>
  );
};

export default Tables;
