'use client'

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';

export default function Home() {
  const [user] = useAuthState(auth);
  console.log(user)

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="dark:text-red-500 text-blue-500 p-4">
      <h1 className="text-xl font-semibold">Hello</h1>

      {user && (
        <div className="mt-4">
          <p className="mb-2">Logged in as: {user.email}</p>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
