import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value || "";

  if (!session) {
    redirect("/");
  }

  let decodedClaims;
  try {
    decodedClaims = await adminAuth.verifySessionCookie(session, true);
  } catch (error) {
    // Session cookie is unavailable or invalid
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <LogoutButton />
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-indigo-900 mb-2">Welcome back!</h2>
            <p className="text-indigo-700 mb-4">You have successfully authenticated using Firebase. Here is your token payload:</p>

            <div className="bg-white rounded p-4 overflow-auto border border-indigo-100">
              <pre className="text-sm text-slate-600">
                {JSON.stringify(decodedClaims, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
