"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { googleAuth } from "@/store/slices/authSlice";

interface UseGoogleAuthOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectTo?: string;
}

export const useGoogleAuth = (options: UseGoogleAuthOptions = {}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleGoogleAuth = useCallback(
    async (idToken: string) => {
      try {
        const result = await dispatch(googleAuth({ idToken })).unwrap();

        if (result) {
          options.onSuccess?.();
          
          // Determine redirect path
          let redirectPath = options.redirectTo;
          if (!redirectPath) {
            if (result.user.onboardingCompleted) {
              redirectPath = "/dashboard";
            } else {
              redirectPath = "/onboarding";
            }
          }
          
          router.push(redirectPath);
        }
      } catch (error: any) {
        console.error("Google authentication failed:", error);
        options.onError?.(error.message || "Google authentication failed");
      }
    },
    [dispatch, router, options]
  );

  const getGoogleAuthUrl = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/google/url");
      const data = await response.json();
      return data.authUrl;
    } catch (error) {
      console.error("Failed to get Google auth URL:", error);
      throw error;
    }
  }, []);

  const redirectToGoogleAuth = useCallback(async () => {
    try {
      const authUrl = await getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      options.onError?.("Failed to redirect to Google authentication");
    }
  }, [getGoogleAuthUrl, options]);

  return {
    handleGoogleAuth,
    getGoogleAuthUrl,
    redirectToGoogleAuth,
  };
};
