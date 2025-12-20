import React, { useState } from "react";
import MenuItems from "./MenuItems";
import Categories from "./Categories";

const tabs = ["Menu Items", "Categories"];

const MenuManagement = () => {
  const [activeTab, setActiveTab] = useState("Menu Items");

  return (
    <div className="container mx-auto bg-[#262626] p-4 rounded-lg">
      <div className="flex items-center gap-3 mb-4 border-b border-gray-600">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-6 py-3 text-lg font-semibold transition-colors duration-300 ${
              activeTab === tab
                ? "text-white border-b-2 border-orange-500"
                : "text-[#ababab] hover:text-white"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "Menu Items" && <MenuItems />}
        {activeTab === "Categories" && <Categories />}
      </div>
    </div>
  );
};

export default MenuManagement;
