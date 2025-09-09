import { Resend } from 'resend';
import { randomUUID } from 'crypto';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import VerificationEmail from '@/components/email-templates/verify-email';

const resend = new Resend(process.env.RESEND_API_KEY);
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface VerifyEmailProps {
  email: string;
  userId: string; // This could be either Convex ID or BetterAuth ID
}

export async function sendVerificationEmail({ email, userId }: VerifyEmailProps): Promise<unknown> {
  try {
    if (!email) {
      throw new Error("Email is null");
    }

    const token = `${randomUUID()}${randomUUID()}`.replace(/-/g, "");

    // Try to find user by email first (since userId might be from BetterAuth)
    const user = await convex.query(api.users.getUserByEmail, { email });

    if (!user) {
      throw new Error(`User not found with email: ${email}`);
    }

    // Update user with verification token using Convex ID
    await convex.mutation(api.users.updateVerificationToken, {
      userId: user._id,
      verifyToken: token,
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const { data, error } = await resend.emails.send({
      from: "RemindMe <no-reply@debasishbarai.com>",
      to: [`${email}`],
      subject: "Verify your email",
      react: VerificationEmail({
        userEmail: email,
        verificationUrl: `${baseUrl}/api/auth/verify?token=${token}`
      }),
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error("Failed to send verification email");
    }

    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Additional helper function for token verification
export async function verifyEmailToken(token: string) {
  try {
    const user = await convex.query(api.users.getUserByVerifyToken, { token });

    if (!user) {
      throw new Error("Invalid or expired verification token");
    }

    // Update user verification status
    await convex.mutation(api.users.updateUserVerification, {
      userId: user._id,
      isVerified: true,
      emailVerified: true,
      verifyToken: undefined, // Clear the token
    });

    return { success: true, user };
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
} 
