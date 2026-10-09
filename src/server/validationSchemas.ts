import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required')
});

export const instantClaimSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  listingName: z.string().optional(),
  listingType: z.string().optional(),
  ownerUserId: z.string().min(1, 'Owner user ID is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  mobile: z.string().min(6, 'Valid mobile number is required'),
  email: z.string().email().optional().or(z.literal('')),
  claimedFrom: z.string().optional(),
  claimSource: z.string().optional()
});

export const partnerClaimSchema = z.object({
  homestayId: z.string().min(1, 'Homestay ID is required'),
  partnerUserId: z.string().min(1, 'Partner User ID is required'),
  email: z.string().email('Valid email is required'),
  ownerName: z.string().optional(),
  mobile: z.string().optional(),
  documents: z.array(z.string()).optional()
});

export const sendOtpSchema = z.object({
  mobile: z.string().min(6, 'Valid mobile number is required'),
  purpose: z.string().optional()
});

export const verifyOtpSchema = z.object({
  mobile: z.string().min(6, 'Valid mobile number is required'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits')
});

export const quoteRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(6, 'Phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  pickupLocation: z.string().optional(),
  destinationLocation: z.string().optional(),
  travelDate: z.string().optional(),
  passengers: z.number().optional()
});

export const reviewActionSchema = z.object({
  claimId: z.string().min(1, 'Claim ID is required'),
  status: z.enum(['APPROVED', 'REJECTED', 'pending', 'approved', 'rejected']),
  adminName: z.string().optional(),
  notes: z.string().optional()
});
