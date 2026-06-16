import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, initializeFirestore, doc, getDocFromServer, setLogLevel } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence internal Firestore warning/error logs to prevent sandboxed iframe notifications
try {
  setLogLevel('silent');
} catch (e) {
  console.warn('Failed to set firestore log level:', e);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export let analytics: Analytics | null = null;
isSupported().then((supported) => {
  if (supported) {
    try {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized successfully.');
    } catch (e) {
      console.warn('Failed to initialize Firebase Analytics:', e);
    }
  } else {
    console.log('Firebase Analytics is not supported in this environment.');
  }
}).catch((e) => {
  console.warn('Error checking Firebase Analytics support:', e);
});

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration.");
    }
  }
}
testConnection();

/**
 * Uploads a compressed binary image blob to Firebase Storage and returns its public URL
 */
export const uploadImageToFirebase = async (blob: Blob, fileName: string): Promise<string> => {
  const getBase64Fallback = (): Promise<string> => new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => resolve(reader.result as string);
  });

  const uploadPromise = (async () => {
    const fileRef = ref(storage, `hillytrip_photos/${Date.now()}_${fileName}`);
    const metadata = {
      contentType: 'image/webp',
    };
    const snapshot = await uploadBytes(fileRef, blob, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  })();

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('TIMEOUT')), 2200);
  });

  try {
    return await Promise.race([uploadPromise, timeoutPromise]);
  } catch (error: any) {
    if (error?.message === 'TIMEOUT') {
      console.warn('[Firebase Link Speedup] Storage upload timed out (2.2s). Using instant Base64 fallback.');
    } else {
      console.warn('[Firebase Link Speedup] Storage upload failed or blocked by CORS. Using direct Base64 fallback:', error);
    }
    return await getBase64Fallback();
  }
};

const provider = new GoogleAuthProvider();
// Required Google Sheet scope
provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');

let isSigningIn = false;
let signInTimestamp = 0;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Start Google sign-in flow with specific Workspace scopes
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  const now = Date.now();
  if (isSigningIn && (now - signInTimestamp < 12000)) {
    throw new Error('A Google login popup is already active. Please proceed with that popup window or close it to try again.');
  }

  try {
    isSigningIn = true;
    signInTimestamp = Date.now();
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Could not find Google Sheets OAuth access token from authorization response.');
    }

    cachedAccessToken = credential.accessToken;

    // Send successful credentials to the iframe parent window if it opened this as a standalone tab
    if (typeof window !== 'undefined' && window.opener) {
      try {
        window.opener.postMessage({
          type: 'GOOGLE_OAUTH_SUCCESS',
          user: {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName
          },
          accessToken: cachedAccessToken
        }, window.location.origin);
      } catch (e) {
        console.error('Failed to notify opener window:', e);
      }
    }

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in popup error context:', error);
    if (error?.code === 'auth/popup-closed-by-user') {
      throw new Error('The login popup was closed before authentication finished. Because of iframe restrictions, you can open the app in a standalone new tab to sign in successfully.');
    }
    if (error?.code === 'auth/cancelled-popup-request') {
      throw new Error('The login popup request was cancelled. Please wait a moment and try clicking once.');
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};
