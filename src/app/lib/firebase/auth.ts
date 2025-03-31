import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where, FieldValue } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { AccountInfo } from '@aptos-labs/wallet-adapter-core';
import type { WalletName } from '@aptos-labs/wallet-adapter-core';

interface AdapterWallet {
  name: WalletName;
}

interface UserData {
  uid: string;
  aptosAddress: string;
  provider: string;
  lastLoginAt: FieldValue;
  createdAt: FieldValue;
  email?: string;
  displayName?: string;
  photoURL?: string;
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
    const now = serverTimestamp();

    // Check if a user with the same email already exists
    const emailQuery = query(collection(db, 'users'), where('email', '==', email));
    const emailQuerySnapshot = await getDocs(emailQuery);

    if (!emailQuerySnapshot.empty) {
      console.warn('A user with this email already exists.');
      return;
    }

    // Create base userData without trying to read existing data first
    const userData: UserData = {
      uid: currentAddress,
      aptosAddress: currentAddress,
      provider: currentProvider,
      lastLoginAt: now,
      createdAt: now,
      ...(email && { email })
    };

    // Try to get existing user data, but don't block if it fails
    try {
      const userDoc = await getDoc(doc(db, 'users', currentAddress));
      if (userDoc.exists()) {
        // Merge with existing data
        userData.createdAt = userDoc.data().createdAt;
        userData.displayName = userDoc.data().displayName;
        userData.photoURL = userDoc.data().photoURL;
      }
    } catch {
      console.log('Could not fetch existing user data, creating new record');
    }

    await setDoc(doc(db, 'users', currentAddress), userData, { merge: true });
  } catch (error) {
    console.error('Error storing user data:', error);
    throw error;
  }
}; 