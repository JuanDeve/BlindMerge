"use client";

import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Sign out from Firebase client
      await auth.signOut();
      
      // Clear the session cookie on backend
      await fetch("/api/auth/logout", { method: "POST" });
      
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
    >
      Sign out
    </button>
  );
}
