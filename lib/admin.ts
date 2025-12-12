import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * Check if the current user is an admin
 * @returns Promise<boolean> - true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return false;
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data();
    return userData.isAdmin === true;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Get the current user's admin status
 * @returns Promise<{ isAdmin: boolean; userId: string | null }>
 */
export async function getAdminStatus(): Promise<{ isAdmin: boolean; userId: string | null }> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { isAdmin: false, userId: null };
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      return { isAdmin: false, userId: user.uid };
    }

    const userData = userDoc.data();
    return { isAdmin: userData.isAdmin === true, userId: user.uid };
  } catch (error) {
    console.error("Error getting admin status:", error);
    return { isAdmin: false, userId: null };
  }
}

