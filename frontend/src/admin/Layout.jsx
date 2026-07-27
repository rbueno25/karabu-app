import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Toaster } from "sonner";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main data-testid="app-main" className="px-8 py-8">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
