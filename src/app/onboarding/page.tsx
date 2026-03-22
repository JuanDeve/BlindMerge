import OnboardingForm from "@/components/OnboardingForm";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { redirect } from "next/navigation";
import * as admin from "firebase-admin";

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value || "";

  if (!session) {
    redirect("/");
  }

  let decodedClaims;
  try {
    decodedClaims = await adminAuth.verifySessionCookie(session, true);
  } catch (error) {
    redirect("/");
  }

  // Check if they already completed onboarding to prevent re-entry
  try {
    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(decodedClaims.uid).get();
    if (userDoc.exists) {
      redirect("/app");
    }
  } catch (err) {
    // If firestore fails (e.g. no connection or bad config), let it render or handle gracefully
    console.error("Firestore check failed:", err);
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <OnboardingForm />
      </div>
    </div>
  );
}
