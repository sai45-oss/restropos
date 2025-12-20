import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../https";
import BackButton from "../components/shared/BackButton";
import BottomNav from "../components/shared/BottomNav";
import Modal from "../components/shared/Modal";
import Register from "../components/auth/Register";

const Users = () => {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const users = usersData?.data?.data || [];

  return (
    <section className="bg-[#1f1f1f] h-screen overflow-auto pb-20">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            User Management
          </h1>
        </div>
        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Add New User
        </button>
      </div>

      <div className="px-16 py-8">
        <div className="overflow-x-auto bg-[#262626] p-4 rounded-lg">
          <table className="w-full text-left text-[#f5f5f5]">
            <thead className="bg-[#333] text-[#ababab]">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan="4" className="text-center p-4 text-white">
                    Loading...
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user._id} className="border-b border-gray-600 hover:bg-[#333]">
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.phone}</td>
                  <td className="p-4 capitalize">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {isRegisterModalOpen && (
          <Modal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} title="Add New User">
              <Register />
          </Modal>
      )}

      <BottomNav />
    </section>
  );
};

export default Users;
