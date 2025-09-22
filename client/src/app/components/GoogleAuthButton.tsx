"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { googleAuth } from "@/store/slices/authSlice";
import Image from "next/image";

interface GoogleAuthButtonProps {
  text?: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleAuthButton({
  text = "Continue with Google",
  className = "",
  onSuccess,
  onError,
  disabled = false,
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const buttonRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (isInitialized.current || !window.google) return;

      try {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        isInitialized.current = true;
      } catch (error) {
        console.error("Failed to initialize Google Sign-In:", error);
        onError?.("Failed to initialize Google Sign-In");
      }
    };

    const handleCredentialResponse = async (response: any) => {
      try {
        if (!response.credential) {
          throw new Error("No credential received from Google");
        }

        const result = await dispatch(
          googleAuth({ idToken: response.credential })
        ).unwrap();

        if (result) {
          onSuccess?.();
          // Redirect based on onboarding status
          if (result.user.onboardingCompleted) {
            router.push("/dashboard");
          } else {
            router.push("/onboarding");
          }
        }
      } catch (error: any) {
        console.error("Google authentication failed:", error);
        onError?.(error.message || "Google authentication failed");
      }
    };

    // Load Google Sign-In script if not already loaded
    if (!window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      script.onerror = () => {
        console.error("Failed to load Google Sign-In script");
        onError?.("Failed to load Google Sign-In");
      };
      document.head.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }

    return () => {
      // Cleanup if needed
      if (window.google && window.google.accounts) {
        window.google.accounts.id.cancel();
      }
    };
  }, [dispatch, router, onSuccess, onError]);

  const handleGoogleSignIn = async () => {
    try {
      if (!window.google) {
        throw new Error("Google Sign-In not available");
      }

      // Create a hidden Google Sign-In button and trigger it
      const googleButton = document.createElement('div');
      googleButton.style.display = 'none';
      document.body.appendChild(googleButton);

      window.google.accounts.id.renderButton(googleButton, {
        theme: "outline",
        size: "large",
        width: "100%",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
      });

      // Trigger the button click
      const button = googleButton.querySelector('div[role="button"]') as HTMLElement;
      if (button) {
        button.click();
      }

      // Clean up
      setTimeout(() => {
        document.body.removeChild(googleButton);
      }, 1000);
    } catch (error: any) {
      console.error("Google Sign-In failed:", error);
      onError?.(error.message || "Google Sign-In failed");
    }
  };

  if (disabled) {
    return (
      <div className={`h-[56px] sm:h-[60px] rounded-lg border border-gray-300 flex items-center justify-center gap-2 bg-gray-100 text-gray-500 cursor-not-allowed ${className}`}>
        <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
        <span className="text-[16px]">Google</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      className={`h-[56px] sm:h-[60px] px-4 py-3 rounded-lg border border-[var(--color-secondary)] flex items-center justify-center gap-2 transition-all duration-300 hover:bg-gray-100 hover:text-[var(--color-secondary)] hover:shadow-sm ${className}`}
    >
      <Image
        src="/google.png"
        alt="Google"
        width={24}
        height={24}
      />
      <span className="text-[16px]">Google</span>
      <div ref={buttonRef} className="hidden"></div>
    </button>
  );
}
