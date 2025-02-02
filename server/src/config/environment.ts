// Environment var handling
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env") });

export const ENV = {
  PORT: process.env.PORT || 4000,
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || "",
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || "",
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || "",
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || "",
  FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID || "",

  FIREBASE_TYPE: process.env.FIREBASE_TYPE || "",
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "",
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || "",
  FIREBASE_PRIVATE_KEY_ID: process.env.FIREBASE_PRIVATE_KEY_ID || "",
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || "",
  FIREBASE_CLIENT_ID: process.env.FIREBASE_CLIENT_ID || "",
  FIREBASE_AUTH_URI: process.env.FIREBASE_AUTH_URI || "",
  FIREBASE_TOKEN_URI: process.env.FIREBASE_TOKEN_URI || "",
  FIREBASE_AUTH_PROVIDER_X509_CERT_URL:
    process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "",
  FIREBASE_CLIENT_X509_CERT_URL:
    process.env.FIREBASE_CLIENT_X509_CERT_URL || "",
  FIREBASE_UNIVERSE_DOMAIN: process.env.FIREBASE_UNIVERSE_DOMAIN || "",

  GEOAPIFY_API_KEY: process.env.GEOAPIFY_API_KEY || "",
};
