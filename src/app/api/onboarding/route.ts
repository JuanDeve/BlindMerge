import { adminAuth } from "@/lib/firebase/admin";
import * as admin from "firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;
    const email = decodedClaims.email;
    const displayName = decodedClaims.name || "";

    const data = await request.json();

    const db = admin.firestore();
    const userDocRef = db.collection("users").doc(uid);

    const userData = {
      role: data.role,
      displayName: displayName || data.displayName,
      email: email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      ...(data.role === "company" ? { companyInfo: data.companyInfo } : { workerInfo: data.workerInfo })
    };

    await userDocRef.set(userData);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error saving onboarding data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
