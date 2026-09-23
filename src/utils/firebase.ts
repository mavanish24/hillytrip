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
  try {
    if (window.localStorage && !window.localStorage.getItem('hillytrip_mock_likes')) {
      window.localStorage.setItem('hillytrip_mock_likes', JSON.stringify([]));
    }
    if (window.localStorage && !window.localStorage.getItem('hillytrip_mock_comments')) {
      window.localStorage.setItem('hillytrip_mock_comments', JSON.stringify([]));
    }
    if (window.localStorage && !window.localStorage.getItem('hillytrip_mock_reviews')) {
      window.localStorage.setItem('hillytrip_mock_reviews', JSON.stringify([]));
    }
  } catch (e) {
    console.warn('[Storage Guard] LocalStorage access blocked or restricted:', e);
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
  return refInstance.path || "https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/default-fallback.png";
}

export async function deleteObject(refInstance: any) {
  return true;
}

// REAL SUPABASE USER MAPPER
export function mapSupabaseUser(user: any) {
  if (!user) return null;
  const rawRole = (user.app_metadata?.role || user.user_metadata?.role || user.role || '').toLowerCase();
  const rawRoles = user.app_metadata?.roles || user.user_metadata?.roles || (rawRole ? [rawRole] : []);
  const isAdmin = rawRole === 'admin' || rawRole === 'super_admin' || user.app_metadata?.isAdmin === true || user.user_metadata?.isAdmin === true;
  const isSuperAdmin = rawRole === 'super_admin' || user.app_metadata?.isSuperAdmin === true || user.user_metadata?.isSuperAdmin === true;

  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.displayName || user.name || user.email?.split('@')[0] || 'Adventurer';

  return {
    uid: user.id || user.uid,
    id: user.id || user.uid,
    email: user.email || '',
    name: displayName,
    displayName: displayName,
    emailVerified: !!user.email_confirmed_at || !!user.emailVerified,
    photoURL: user.user_metadata?.avatar_url || user.user_metadata?.picture || user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.email || 'hillytrip')}`,
    metadata: user.metadata,
    role: (rawRole === 'super_admin' || rawRole === 'admin' || rawRole === 'partner' || rawRole === 'moderator' || rawRole === 'contributor' || rawRole === 'taxi_operator') ? rawRole : 'traveler',
    roles: Array.isArray(rawRoles) && rawRoles.length > 0 ? rawRoles : ['traveler'],
    status: 'active' as const,
    passwordHash: '',
    customPermissions: user.customPermissions || [],
    createdAt: user.created_at || user.createdAt || new Date().toISOString(),
    isAdmin,
    isSuperAdmin,
    themeMode: user.user_metadata?.themeMode || null
  };
}

// ENSURE USER PROFILE AND PREFERENCES EXIST SAFELY
async function ensureUserProfileExists(supabase: any, user: any, usernameArg?: string, fullNameArg?: string) {
  if (!supabase || !user?.id) return;
  try {
    const userId = user.id;
    const email = user.email;
    const fullName = fullNameArg || user.user_metadata?.full_name || user.user_metadata?.name || email?.split('@')[0];
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email || 'user')}`;

    const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) {
      // Table doesn't exist or RLS not present - non-fatal
      return;
    }
    if (!profile) {
      let username = usernameArg;
      if (!username && email) {
        const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        username = `${baseUsername}${randomSuffix}`;
      }

      await supabase.from('profiles').insert({
        id: userId,
        username: username || `user_${userId.substring(0, 6)}`,
        full_name: fullName,
        email: email,
        avatar_url: avatarUrl,
        bio: 'HillyTrip Explorer',
        country: '',
        joined_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  } catch (e) {
    console.debug('[Supabase Auth] Profile sync skipped:', e);
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
    try {
      const supabase = await getSupabase();
      if (supabase?.auth) {
        await supabase.auth.signOut();
      }
    } finally {
      auth._currentUser = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hillytrip_user_session');
        localStorage.removeItem('hillytrip_user');
      }
    }
  }
};

const authListeners = new Set<(user: any) => void>();

export function onAuthStateChanged(authInstance: any, callback: (user: any) => void) {
  authListeners.add(callback);

  // 1. Fetch current session on bind
  getSupabase().then(async (supabase) => {
    if (!supabase?.auth) {
      callback(null);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const hUser = mapSupabaseUser(session.user);
        auth._currentUser = hUser;
        callback(hUser);
        ensureUserProfileExists(supabase, session.user).catch(() => {});
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
          ensureUserProfileExists(supabase, session.user).catch(() => {});
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
  if (!supabase?.auth) throw new Error("Supabase Auth is not initialized.");

  // Validate password length
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }

  // Create auth user
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
        username: username.trim()
      }
    }
  });

  if (error) {
    console.error('[Supabase Auth] signUp error:', error);
    throw error;
  }

  if (data?.user) {
    const mappedUser = mapSupabaseUser(data.user);
    auth._currentUser = mappedUser;
    if (typeof window !== 'undefined') {
      localStorage.setItem('hillytrip_user_session', JSON.stringify(mappedUser));
    }
    ensureUserProfileExists(supabase, data.user, username, fullName).catch(() => {});
    return {
      user: mappedUser,
      rawUser: data.user,
      session: data.session
    };
  }

  return data;
}

// EMAIL LOGIN METHOD
export async function signInWithEmailAndPassword(email: string, password: string) {
  const supabase = await getSupabase();
  if (!supabase?.auth) throw new Error("Supabase Auth is not initialized.");

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password
  });

  if (error) {
    console.error('[Supabase Auth] signInWithPassword error:', error);
    throw error;
  }

  if (data?.user) {
    const mappedUser = mapSupabaseUser(data.user);
    auth._currentUser = mappedUser;
    if (typeof window !== 'undefined') {
      localStorage.setItem('hillytrip_user_session', JSON.stringify(mappedUser));
    }
    ensureUserProfileExists(supabase, data.user).catch(() => {});
    return {
      user: mappedUser,
      rawUser: data.user,
      session: data.session
    };
  }

  return data;
}

// GOOGLE OAUTH SIGN-IN WITH POPUP SUPPORT (SANDBOX FRIENDLY)
export const googleSignIn = async (): Promise<{ user: any; accessToken: string } | null> => {
  const supabase = await getSupabase();
  if (!supabase?.auth) throw new Error("Supabase Auth is not initialized.");

  // Use current window origin so that PKCE code verifier stored in localStorage matches redirect callback origin
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const redirectTo = `${currentOrigin}/auth-callback.html`;

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
    let popup: Window | null = null;
    try {
      popup = window.open(data.url, 'google_oauth_popup', 'width=600,height=700,status=no,toolbar=no,menubar=no');
    } catch (openErr) {
      console.warn('[Google Auth] window.open failed, attempting _blank fallback:', openErr);
    }

    if (!popup) {
      // If popup was blocked by browser, attempt opening in a new tab
      try {
        popup = window.open(data.url, '_blank');
      } catch (e) {}
      
      if (!popup) {
        // As a last fallback in non-sandboxed environment
        if (typeof window !== 'undefined' && window.top === window.self) {
          window.location.href = data.url;
          return null;
        }
        throw new Error("Sign-in popup was blocked by your browser. Please allow popups or open in a new tab.");
      }
    }

    // Wait for auth callback page in popup to communicate authentication tokens back
    return new Promise((resolve, reject) => {
      let resolved = false;

      const handleMessage = async (event: MessageEvent) => {
        if (event.data?.type === 'SUPABASE_OAUTH_SUCCESS') {
          resolved = true;
          window.removeEventListener('message', handleMessage);
          clearInterval(checkClosed);

          const { code, hash } = event.data;
          let sessionUser: any = null;
          let accessToken = '';

          try {
            // 1. PKCE Authorization code exchange
            if (code) {
              const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
              if (exchangeError) {
                console.warn("[Supabase Auth] Error exchanging PKCE code for session:", exchangeError);
              } else if (exchangeData?.session?.user) {
                sessionUser = exchangeData.session.user;
                accessToken = exchangeData.session.access_token;
              }
            }

            // 2. Implicit hash token setSession
            if (!sessionUser && hash) {
              const params = new URLSearchParams(hash.substring(1));
              const at = params.get('access_token');
              const rt = params.get('refresh_token');

              if (at && rt) {
                const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                  access_token: at,
                  refresh_token: rt
                });
                if (!sessionError && sessionData?.session?.user) {
                  sessionUser = sessionData.session.user;
                  accessToken = sessionData.session.access_token;
                }
              }
            }

            // 3. Fallback to active client session
            if (!sessionUser) {
              const { data: currentSessionData } = await supabase.auth.getSession();
              if (currentSessionData?.session?.user) {
                sessionUser = currentSessionData.session.user;
                accessToken = currentSessionData.session.access_token;
              }
            }

            if (!sessionUser) {
              reject(new Error("Invalid credentials received from the sign-in portal."));
              return;
            }

            const mappedUser = mapSupabaseUser(sessionUser);
            auth._currentUser = mappedUser;
            if (typeof window !== 'undefined') {
              localStorage.setItem('hillytrip_user_session', JSON.stringify(mappedUser));
            }
            ensureUserProfileExists(supabase, sessionUser).catch(() => {});

            resolve({
              user: mappedUser,
              accessToken: accessToken || 'supabase_token'
            });
          } catch (sessionErr: any) {
            reject(sessionErr);
          }
        } else if (event.data?.type === 'SUPABASE_OAUTH_FAILURE') {
          resolved = true;
          window.removeEventListener('message', handleMessage);
          clearInterval(checkClosed);
          const errorDetail = event.data.errorDescription || event.data.error || "Authentication failed.";
          console.warn('[Google OAuth Failure detail]:', event.data);
          reject(new Error(errorDetail));
        }
      };

      window.addEventListener('message', handleMessage);

      // Guard in case the user closes the sign-in popup manually
      const checkClosed = setInterval(() => {
        try {
          if (popup && popup.closed) {
            clearInterval(checkClosed);
            setTimeout(() => {
              if (!resolved) {
                window.removeEventListener('message', handleMessage);
                const cancelErr = new Error("Sign-in window was closed by the user.");
                (cancelErr as any).code = 'auth/popup-closed-by-user';
                (cancelErr as any).isCancellation = true;
                reject(cancelErr);
              }
            }, 600);
          }
        } catch (e) {
          // Cross-origin access check protection
        }
      }, 800);
    });

  } catch (err: any) {
    if (err?.code === 'auth/popup-closed-by-user' || err?.isCancellation || err?.message?.includes('closed by the user')) {
      console.info('[Google Auth] Sign-in window was closed or cancelled by the user.');
    } else {
      console.error('Google authorization flow failure detail:', err);
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
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const token = await getAccessToken();
      if (onAuthSuccess) onAuthSuccess(user, token || '');
    } else {
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const setCachedAccessToken = (token: string | null) => {};
export const getAccessToken = async (): Promise<string> => {
  try {
    const supabase = await getSupabase();
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        return data.session.access_token;
      }
    }
  } catch {}
  return '';
};
export const logout = async () => {
  await auth.signOut();
};
export const analytics = null;
