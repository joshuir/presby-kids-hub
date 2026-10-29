import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
  NEXT_PUBLIC_ALGOLIA_APP_ID: z.string().optional(),
  NEXT_PUBLIC_ALGOLIA_SEARCH_KEY: z.string().optional(),
  NEXT_PUBLIC_ADMIN_BYPASS: z.string().optional(),
});

const serverSchema = z.object({
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),
  SENDGRID_TO_EMAIL: z.string().email().optional(),
  FIREBASE_SERVICE_ACCOUNT_JSON: z.string().optional(),
  CONTENTFUL_SPACE_ID: z.string().optional(),
  CONTENTFUL_DELIVERY_TOKEN: z.string().optional(),
  CONTENTFUL_PREVIEW_TOKEN: z.string().optional(),
  CONTENTFUL_ENV: z.string().optional(),
  ALGOLIA_ADMIN_KEY: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  GOOGLE_CALENDAR_ID: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  YOUTUBE_API_KEY: z.string().optional(),
  YOUTUBE_WELCOME_VIDEO_ID: z.string().optional(),
});

export const env = {
  client: clientSchema.parse(process.env),
  server: serverSchema.parse(process.env),
};

