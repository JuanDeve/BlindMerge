import { adminAuth } from "@/lib/firebase/admin";
import * as admin from "firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
    }

    // Decode token to get UID
    const decodedIdToken = await adminAuth.verifyIdToken(idToken);

    // Set cookie expiration to 5 days
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    // Check if user exists in Firestore
    const db = admin.firestore();
    const userDocRef = db.collection("users").doc(decodedIdToken.uid);
    const userDoc = await userDocRef.get();
    
    const isNewUser = !userDoc.exists;

    return NextResponse.json({ success: true, isNewUser }, { status: 200 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
