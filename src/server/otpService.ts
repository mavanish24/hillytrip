import crypto from 'crypto';

interface OtpRecord {
  mobile: string;
  code: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

const otpStore = new Map<string, OtpRecord>();

// Clean expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [mobile, record] of otpStore.entries()) {
    if (now > record.expiresAt) {
      otpStore.delete(mobile);
    }
  }
}, 5 * 60 * 1000);

export function generateOtp(mobile: string): { success: boolean; otp?: string; message: string } {
  const cleanMobile = mobile.trim().replace(/[^0-9+]/g, '');
  if (!cleanMobile || cleanMobile.length < 6) {
    return { success: false, message: 'Invalid mobile number format' };
  }

  const existing = otpStore.get(cleanMobile);
  const now = Date.now();

  // Rate limit: 1 OTP request per 45 seconds per mobile number
  if (existing && now - existing.createdAt < 45 * 1000) {
    const waitSec = Math.ceil((45 * 1000 - (now - existing.createdAt)) / 1000);
    return { 
      success: false, 
      message: `Please wait ${waitSec} seconds before requesting a new OTP.` 
    };
  }

  // Generate cryptographically secure 6-digit number
  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes

  otpStore.set(cleanMobile, {
    mobile: cleanMobile,
    code,
    expiresAt,
    attempts: 0,
    createdAt: now
  });

  console.log(`[OTP Service] Generated OTP for ${cleanMobile}: ${code} (Expires in 10m)`);

  return {
    success: true,
    otp: process.env.NODE_ENV === 'production' ? undefined : code, // Return code in non-production for testing
    message: 'OTP sent successfully to registered mobile number.'
  };
}

export function verifyOtp(mobile: string, code: string): { success: boolean; message: string } {
  const cleanMobile = mobile.trim().replace(/[^0-9+]/g, '');
  const cleanCode = code.trim();

  if (!cleanMobile || !cleanCode) {
    return { success: false, message: 'Mobile number and OTP code are required.' };
  }

  const record = otpStore.get(cleanMobile);
  const now = Date.now();

  if (!record) {
    return { success: false, message: 'No active OTP found or OTP has expired. Please request a new OTP.' };
  }

  if (now > record.expiresAt) {
    otpStore.delete(cleanMobile);
    return { success: false, message: 'OTP has expired. Please request a new OTP.' };
  }

  if (record.attempts >= 5) {
    otpStore.delete(cleanMobile);
    return { success: false, message: 'Too many invalid attempts. This OTP has been invalidated for security. Please request a new one.' };
  }

  if (record.code !== cleanCode) {
    record.attempts += 1;
    otpStore.set(cleanMobile, record);
    const remaining = 5 - record.attempts;
    return { 
      success: false, 
      message: `Invalid OTP code. ${remaining} attempt(s) remaining.` 
    };
  }

  // Successfully verified! Clear OTP
  otpStore.delete(cleanMobile);
  return { success: true, message: 'OTP verified successfully!' };
}
