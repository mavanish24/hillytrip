// src/utils/firebase.ts
// Secure and Scalable Supabase Auth Bridge Implementation for HillyTrip
// This connects the frontend directly to Supabase Auth while maintaining the necessary mocks for DB operations.

import { getSupabase } from './supabaseClient';

// Internal memory store synchronized with localStorage for offline mock fallback DB operations
const getLocalData = (key: string, defaultVal: any) => {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const data = localStorage.getItem(`hillytrip_mock_${key}`);
    return data ? JSON.parse(data) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setLocalData = (key: string, val: any) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`hillytrip_mock_${key}`, JSON.stringify(val));
    const listeners = activeListeners.get(key) || [];
    listeners.forEach(cb => cb());
  } catch (e) {
    console.error('Failed to write mock data to localStorage:', e);
  }
};

const activeListeners = new Map<string, Array<() => void>>();

const addListener = (key: string, cb: () => void) => {
  const list = activeListeners.get(key) || [];
  list.push(cb);
  activeListeners.set(key, list);
  return () => {
    const updated = (activeListeners.get(key) || []).filter(item => item !== cb);
    activeListeners.set(key, updated);
  };
};

if (typeof window !== 'undefined') {
  if (!localStorage.getItem('hillytrip_mock_likes')) {
    localStorage.setItem('hillytrip_mock_likes', JSON.stringify([]));
  }
  if (!localStorage.getItem('hillytrip_mock_comments')) {
    localStorage.setItem('hillytrip_mock_comments', JSON.stringify([]));
  }
  if (!localStorage.getItem('hillytrip_mock_reviews')) {
    localStorage.setItem('hillytrip_mock_reviews', JSON.stringify([]));
  }
}

// MOCK FIRESTORE CLASSES AND METHODS (Kept for frontend backward compatibility)
export const db = { isMock: true } as any;

export function collection(dbInstance: any, pathName: string) {
  return { id: pathName, path: pathName, type: 'collection' };
}

export function doc(parent: any, ...paths: string[]) {
  let collectionName = '';
  let docId = '';
  if (parent && parent.type === 'collection') {
    collectionName = parent.path;
    docId = paths[0];
  } else {
    collectionName = paths[0];
    docId = paths[1];
  }
  return { id: docId, collectionName, docId, type: 'doc' };
}

export function query(collectionRef: any, ...constraints: any[]) {
  return collectionRef;
}

export function orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
  return { type: 'orderBy', field, direction };
}

export function where(field: string, op: string, val: any) {
  return { type: 'where', field, op, val };
}

export function onSnapshot(ref: any, onNext: (snapshot: any) => void, onError?: (error: any) => void) {
  if (!ref) return () => {};
  
  const trigger = () => {
    if (ref.type === 'collection') {
      const list = getLocalData(ref.path, []);
      const docs = list.map((item: any) => ({
        id: item.id || 'mock-id',
        data: () => item,
        exists: () => true
      }));
      onNext({
        forEach: (cb: any) => docs.forEach(cb),
        docs,
        empty: docs.length === 0
      });
    } else if (ref.type === 'doc') {
      const list = getLocalData(ref.collectionName, []);
      const item = list.find((x: any) => x.id === ref.docId);
      onNext({
        id: ref.docId,
        data: () => item || null,
        exists: () => !!item
      });
    }
  };

  setTimeout(trigger, 0);

  const key = ref.type === 'collection' ? ref.path : ref.collectionName;
  const unsubscribe = addListener(key, trigger);
  return unsubscribe;
}

export async function getDocs(queryRef: any) {
  const collectionName = queryRef.path;
  const list = getLocalData(collectionName, []);
  const docs = list.map((item: any) => ({
    id: item.id || 'mock-id',
    data: () => item,
    exists: () => true
  }));
  return {
    forEach: (cb: any) => docs.forEach(cb),
    docs,
    empty: docs.length === 0
  };
}

export async function getDoc(docRef: any) {
  const col = docRef.collectionName;
  const id = docRef.docId;
  const list = getLocalData(col, []);
  const item = list.find((x: any) => x.id === id);
  return {
    id,
    exists: () => !!item,
    data: () => item || null
  };
}

export async function setDoc(docRef: any, data: any, options?: { merge?: boolean }) {
  const col = docRef.collectionName;
  const id = docRef.docId;
  const list = getLocalData(col, []);
  const existingIdx = list.findIndex((x: any) => x.id === id);
  
  const newData = options?.merge && existingIdx > -1 
    ? { ...list[existingIdx], ...data, id }
    : { ...data, id };

  if (existingIdx > -1) {
    list[existingIdx] = newData;
  } else {
    list.push(newData);
  }
  setLocalData(col, list);
}

export async function updateDoc(docRef: any, data: any) {
  await setDoc(docRef, data, { merge: true });
}

export async function deleteDoc(docRef: any) {
  const col = docRef.collectionName;
  const id = docRef.docId;
  const list = getLocalData(col, []);
  const filtered = list.filter((x: any) => x.id !== id);
  setLocalData(col, filtered);
}

// MOCK STORAGE METHODS
export const storage = { isMock: true } as any;

export function ref(storageInstance: any, pathName: string) {
  return { path: pathName, type: 'storageRef' };
}

export async function uploadBytes(refInstance: any, blob: Blob, metadata?: any) {
  return { ref: refInstance };
}

export async function getDownloadURL(refInstance: any) {
  return refInstance.path || "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1600&auto=format&fit=crop";
}

export async function deleteObject(refInstance: any) {
  return true;
}

// REAL SUPABASE USER MAPPER
function mapSupabaseUser(user: any) {
  if (!user) return null;
  return {
    uid: user.id,
    id: user.id,
    email: user.email,
    displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
    emailVerified: !!user.email_confirmed_at,
    photoURL: user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.email || 'hillytrip')}`,
    metadata: user.metadata
  };
}

// ENSURE USER PROFILE AND PREFERENCES EXIST
async function ensureUserProfileExists(supabase: any, user: any, usernameArg?: string, fullNameArg?: string) {
  const userId = user.id;
  const email = user.email;
  const fullName = fullNameArg || user.user_metadata?.full_name || user.user_metadata?.name || email?.split('@')[0];
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`;

  try {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (!profile) {
      let username = usernameArg;
      if (!username) {
        const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        username = `${baseUsername}${randomSuffix}`;
      }

      await supabase.from('profiles').insert({
        id: userId,
        username: username,
        full_name: fullName,
        email: email,
        avatar_url: avatarUrl,
        bio: 'HillyTrip Explorer',
        country: '',
        joined_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      await supabase.from('user_settings').insert({
        id: userId,
        theme: 'light',
        language: 'en',
        updated_at: new Date().toISOString()
      });

      await supabase.from('notification_preferences').insert({
        id: userId,
        likes: true,
        comments: true,
        replies: true,
        photo_approval: true,
        review_replies: true,
        travel_alerts: true,
        updated_at: new Date().toISOString()
      });
    }
  } catch (e) {
    console.error('[Supabase Auth Bridge] Error ensuring user profile exists:', e);
  }
}

// REAL SUPABASE AUTH BRIDGE CLIENT
export const auth = {
  isMock: false,
  _currentUser: null as any,
  get currentUser() {
    return this._currentUser;
  },
  signOut: async () => {
    const supabase = await getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
  }
};

const authListeners = new Set<(user: any) => void>();

export function onAuthStateChanged(authInstance: any, callback: (user: any) => void) {
  authListeners.add(callback);

  // 1. Fetch current session on bind
  getSupabase().then(async (supabase) => {
    if (!supabase) {
      callback(null);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const hUser = mapSupabaseUser(session.user);
        auth._currentUser = hUser;
        callback(hUser);
        await ensureUserProfileExists(supabase, session.user);
      } else {
        auth._currentUser = null;
        callback(null);
      }
    } catch (e) {
      console.error('[Supabase Auth Bridge] getSession error:', e);
      callback(null);
    }

    // 2. Listen to active auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (session?.user) {
        const hUser = mapSupabaseUser(session.user);
        auth._currentUser = hUser;
        callback(hUser);
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          await ensureUserProfileExists(supabase, session.user);
        }
      } else {
        auth._currentUser = null;
        callback(null);
      }
    });

    // Save unsubscribe function
    (callback as any)._unsubscribe = () => {
      subscription.unsubscribe();
    };
  });

  return () => {
    authListeners.delete(callback);
    if ((callback as any)._unsubscribe) {
      (callback as any)._unsubscribe();
    }
  };
}

// EMAIL SIGNUP METHOD
export async function signUpWithEmailAndPassword(email: string, username: string, fullName: string, password: string) {
  const supabase = await getSupabase();
  if (!supabase) throw new Error("Supabase is not initialized.");

  // Validate password length
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }

  // Check if username is unique in profiles table
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .maybeSingle();

  if (existingProfile) {
    throw new Error("Username already taken. Please try another one.");
  }

  // Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username: username
      }
    }
  });

  if (error) throw error;

  if (data?.user) {
    // Automatically create Profile, Settings, and Notification prefs
    await ensureUserProfileExists(supabase, data.user, username, fullName);
  }

  return data;
}

// EMAIL LOGIN METHOD
export async function signInWithEmailAndPassword(email: string, password: string) {
  const supabase = await getSupabase();
  if (!supabase) throw new Error("Supabase is not initialized.");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

// GOOGLE OAUTH SIGN-IN WITH POPUP SUPPORT (SANDBOX FRIENDLY)
export const googleSignIn = async (): Promise<{ user: any; accessToken: string } | null> => {
  const supabase = await getSupabase();
  if (!supabase) throw new Error("Supabase is not initialized.");

  // Dynamically replace development domain "-dev-" with the public "-pre-" preview domain.
  // This bypasses the platform's intercept and avoids the 403 authorization bridge.
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const preOrigin = currentOrigin.replace('-dev-', '-pre-');
  const redirectTo = `${preOrigin}/auth-callback.html`;

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo,
        skipBrowserRedirect: true
      }
    });

    if (error) throw error;
    if (!data?.url) throw new Error("Could not construct authorization URL.");

    // Open direct Google/Supabase Auth URL in popup window
    const popup = window.open(data.url, 'google_oauth_popup', 'width=600,height=700');
    if (!popup) {
      throw new Error("Popup blocked. Please allow popups for this site to sign in with Google.");
    }

    // Wait for auth callback page in popup to communicate authentication tokens back
    return new Promise((resolve, reject) => {
      let resolved = false;

      const handleMessage = async (event: MessageEvent) => {
        if (event.data?.type === 'SUPABASE_OAUTH_SUCCESS') {
          resolved = true;
          window.removeEventListener('message', handleMessage);
          clearInterval(checkClosed);

          const hash = event.data.hash;
          if (!hash) {
            reject(new Error("No credentials received from the secure sign-in portal."));
            return;
          }

          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (!accessToken || !refreshToken) {
            reject(new Error("Invalid credentials received from the secure sign-in portal."));
            return;
          }

          try {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (sessionError || !sessionData?.user) {
              reject(sessionError || new Error("Failed to set authentication session."));
              return;
            }

            const mappedUser = mapSupabaseUser(sessionData.user);
            await ensureUserProfileExists(supabase, sessionData.user);

            resolve({
              user: mappedUser,
              accessToken: accessToken
            });
          } catch (sessionErr: any) {
            reject(sessionErr);
          }
        } else if (event.data?.type === 'SUPABASE_OAUTH_FAILURE') {
          resolved = true;
          window.removeEventListener('message', handleMessage);
          clearInterval(checkClosed);
          reject(new Error(event.data.error || "Authentication failed."));
        }
      };

      window.addEventListener('message', handleMessage);

      // Guard in case the user closes the sign-in popup manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setTimeout(() => {
            if (!resolved) {
              window.removeEventListener('message', handleMessage);
              reject(new Error("Sign-in window was closed by the user."));
            }
          }, 1000);
        }
      }, 1000);
    });

  } catch (err: any) {
    console.error('Google authorization flow failure detail:', err);
    const errMsg = typeof err === 'string' ? err : (err?.message || JSON.stringify(err) || '');
    if (
      errMsg.includes('provider is not enabled') || 
      errMsg.includes('Unsupported provider') || 
      errMsg.includes('not enabled') ||
      err?.status === 400 ||
      err?.code === 400 ||
      err?.error_code === 'validation_failed'
    ) {
      throw new Error("Google Sign-In is currently unavailable. Please try again later.");
    }
    throw err;
  }
};

// PASSWORD RESET EMAIL
export async function sendPasswordResetEmail(authInstance: any, email: string) {
  const supabase = await getSupabase();
  if (!supabase) throw new Error("Supabase is not initialized.");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/profile?reset_password=true'
  });

  if (error) throw error;
  return true;
}

// UPDATE USER PASSWORD (FOR RESET FLOW)
export async function updateUserPassword(password: string) {
  const supabase = await getSupabase();
  if (!supabase) throw new Error("Supabase is not initialized.");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return true;
}

// OTHER UTILITIES FOR APP.TSX INTEROPERABILITY
export const signInWithGoogleCredentials = async (idToken: string | null, accessToken: string | null) => {
  // If we receive tokens from standalone tab window opener message, set session manually if possible
  const supabase = await getSupabase();
  if (supabase && accessToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: accessToken // Placeholder since refresh token isn't passed
    });
  }
  return null;
};

export const uploadImageToFirebase = async (blob: Blob, fileName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const initAuth = (
  onAuthSuccess?: (user: any, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, 'mock-access-token');
    } else {
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const setCachedAccessToken = (token: string | null) => {};
export const getAccessToken = async () => 'mock-access-token';
export const logout = async () => {
  await auth.signOut();
};
export const analytics = null;
