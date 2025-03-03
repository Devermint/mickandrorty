"use client";

// utils/firebaseUserUtils.ts
import { doc, setDoc, getDoc, query, where, collection, getDocs, FieldValue, serverTimestamp } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { AccountInfo, AdapterWallet } from '@aptos-labs/wallet-adapter-react';

interface UserData {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  aptosAddress?: string;
  provider: 'aptos_google' | 'aptos_apple' | 'wallet';
  createdAt: number | FieldValue;
  lastLoginAt: number | FieldValue;
}

export const storeUserData = async (account: AccountInfo, wallet: AdapterWallet, email: string) => {
  if (!account?.address) return;

  const currentAddress = account.address.toString();
  const currentProvider = wallet?.name?.toLowerCase().includes('google') 
    ? 'aptos_google' 
    : wallet?.name?.toLowerCase().includes('apple')
      ? 'aptos_apple'
      : 'wallet';

  try {
    // Use Firebase server-side timestamp
    const now = serverTimestamp();

    // Check if a user with the same email already exists
    const emailQuery = query(collection(db, 'users'), where('email', '==', email));
    const emailQuerySnapshot = await getDocs(emailQuery);

    if (!emailQuerySnapshot.empty) {
      console.warn('A user with this email already exists.');
      return; // Optionally, handle this case as needed
    }

    const userDoc = await getDoc(doc(db, 'users', currentAddress));
    
    const userData: UserData = {
      uid: currentAddress,
      aptosAddress: currentAddress,
      provider: currentProvider,
      lastLoginAt: now,
      createdAt: userDoc.exists() ? userDoc.data().createdAt : now,
      ...(email && { email }),
      ...userDoc.exists() && {
        displayName: userDoc.data().displayName,
        photoURL: userDoc.data().photoURL,
      }
    };

    await setDoc(doc(db, 'users', currentAddress), userData, { merge: true });
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};

export const getUserData = async (address: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', address));
    return userDoc.data() as UserData;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};