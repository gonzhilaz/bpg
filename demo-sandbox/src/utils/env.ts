/**
 * Centralized dynamic URL resolver for 13C Payment Gateway
 * Automatically selects between local environment, Vercel deployments, or custom VPS hosts.
 */

export const getEnvUrl = {
  api: (): string => {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      return "http://localhost:8080";
    }
    return "https://bpg-backend.onrender.com";
  },

  merchant: (): string => {
    if (process.env.NEXT_PUBLIC_MERCHANT_URL) {
      return process.env.NEXT_PUBLIC_MERCHANT_URL;
    }
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      return "http://localhost:3001";
    }
    return "https://bpg-dashboard-coral.vercel.app";
  },

  admin: (): string => {
    if (process.env.NEXT_PUBLIC_ADMIN_URL) {
      return process.env.NEXT_PUBLIC_ADMIN_URL;
    }
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      return "http://localhost:3002";
    }
    return "https://bpg-admin.vercel.app";
  },

  sandbox: (): string => {
    if (process.env.NEXT_PUBLIC_SANDBOX_URL) {
      return process.env.NEXT_PUBLIC_SANDBOX_URL;
    }
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      return "http://localhost:3000/sandbox";
    }
    return "https://bpg-sandbox.vercel.app/sandbox";
  },

  swagger: (): string => {
    if (process.env.NEXT_PUBLIC_SWAGGER_URL) {
      return process.env.NEXT_PUBLIC_SWAGGER_URL;
    }
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      return "http://localhost:8080/swagger";
    }
    return "https://bpg-backend.onrender.com/swagger";
  },
};

