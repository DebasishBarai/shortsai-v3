import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";
import { VerificationEmail } from "@/components/email-templates/verify-email";
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";
import { polar as polarClient } from "@/lib/polar";
import { api } from "../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const resend = new Resend(process.env.RESEND_API_KEY);

const PRODUCT_CONFIGS = {
  [process.env.POLAR_STARTER_PRODUCT_ID as string]: {
    name: "Starter Pack",
    credits: 60,
    slug: "starter",
  },
  [process.env.POLAR_CREATOR_PRODUCT_ID as string]: {
    name: "Creator Pack",
    credits: 160,
    slug: "creator",
  },
  [process.env.POLAR_PRO_PRODUCT_ID as string]: {
    name: "Pro Pack",
    credits: 360,
    slug: "pro",
  },
};

export const auth = betterAuth({
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await resend.emails.send({
          from: "Shorts AI <no-reply@debasishbarai.com>",
          to: [user.email],
          subject: "Verify your email address",
          react: VerificationEmail({
            userEmail: user.email,
            verificationUrl: url,
          }),
        });
      } catch (error) {
        console.error("Error sending verification email:", error);
      }
    },
    sendOnSignUp: true,
  },
  plugins: [
    nextCookies(),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            { productId: process.env.POLAR_STARTER_PRODUCT_ID!, slug: "starter" },
            { productId: process.env.POLAR_CREATOR_PRODUCT_ID!, slug: "creator" },
            { productId: process.env.POLAR_PRO_PRODUCT_ID!, slug: "pro" },
          ],
          successUrl: "/payment-success?checkout_id={CHECKOUT_ID}",
          authenticatedUsersOnly: true,
        }),
        portal(),
        usage(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET!,
          onOrderPaid: async (payload) => {
            try {
              console.log("Order paid:", payload);
              const { data } = payload;

              if (!data.paid || data.status !== "paid") {
                console.log("Order not fully paid, skipping credit update");
                return;
              }

              const productConfig = PRODUCT_CONFIGS[data.productId];
              if (!productConfig) {
                console.error(`Unknown product ID: ${data.productId}`);
                return;
              }

              // BetterAuth user ID is stored in customer.externalId
              const userId = data.customer.externalId!;
              await convex.mutation(api.users.addCredits, {
                userId,
                credits: productConfig.credits,
                polarCustomerId: data.customerId,
              });

              console.log(`✅ Updated user ${userId} with ${productConfig.credits} credits`);
            } catch (error) {
              console.error("❌ Error processing order payment:", error);
            }
          },
        }),
      ],
    }),
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24 * 30,
  },
});

