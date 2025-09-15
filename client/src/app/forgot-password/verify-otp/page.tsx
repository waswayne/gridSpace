"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import api from "@/services/api";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  // Check if we have a resetToken on mount
  useEffect(() => {
    const resetToken = localStorage.getItem("resetToken");
    if (!resetToken) {
      router.push("/forgot-password");
    }
  }, [router]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <div className="min-h-screen bg-[#F7F5F5] flex items-center justify-center p-4">
      <div className="w-full max-w-[1240px] h-[950px] max-md:w-full max-md:h-[810px] max-md:mx-4 max-md:relative max-md:top-[calc(50%-810px/2+17px)] bg-white border border-[rgba(0,47,91,0.19)] rounded-lg shadow-[0_4px_4px_5px_rgba(231,230,230,0.25)] flex items-center justify-center">
        <div className="w-full max-w-[624px] h-[541px] max-md:w-[369px] max-md:h-[463px] max-md:px-2 max-md:pt-8 bg-white border border-[#EBECF2] rounded-[40px] shadow-[0_30.944px_61.8881px_rgba(37,49,76,0.08)] flex flex-col items-center pt-8 gap-6 max-md:gap-6">
          {/* Logo Section */}
          <div className="w-[72px] h-[72px] max-md:w-[64px] max-md:h-[64px] bg-[#FFEBE3] rounded-2xl max-md:rounded-4xl flex items-center justify-center">
            <Mail className="w-10 h-10 max-md:w-8 max-md:h-8 text-[#F25417]" />
          </div>

          {/* Header Section */}
          <div className="flex flex-col items-center gap-4 max-md:gap-3">
            <h1 className="text-[32px] leading-[39px] max-md:text-[20px] max-md:leading-[24px] font-semibold text-[#002F5B] max-md:text-[#121212] text-center">
              Verify Code
            </h1>
            <p className="text-[18px] leading-[22px] max-md:text-[16px] max-md:leading-[19px] text-[#686767] text-center max-w-[518px] max-md:max-w-[328px]">
              Enter the verification code sent to your email address
            </p>
          </div>

          {/* OTP Input Section */}
          <div className="w-full max-w-[544px] max-md:w-[353px] px-8 max-md:px-0">
            <div className="flex flex-col gap-3 max-md:gap-3">
              <label className="text-[16px] leading-[18px] max-md:text-[16px] font-medium text-[#19213D]">
                Verification Code
              </label>

              <div className="flex justify-center gap-3 max-md:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-16 h-16 max-md:w-[40px] max-md:h-[40px] text-center text-[32px] max-md:text-[24px] font-medium text-[#D1D5DB] bg-white border border-[#D1D5DB] rounded-2xl max-md:rounded-lg shadow-[0_0.5px_2px_rgba(25,33,61,0.11)] focus:outline-none focus:border-[#F25417] focus:text-[#19213D] transition-colors"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="w-full max-w-[544px] max-md:w-[353px] px-10 max-md:px-0 flex flex-col gap-6 max-md:gap-6">
            {/* Verify Button */}
            <div className="w-full max-md:w-[323px]">
              <button
                className="w-full h-[67px] max-md:h-[60px] bg-[#F25417] rounded-lg max-md:rounded-4xl flex items-center justify-center gap-2 text-white text-[16px] leading-[19px] font-medium hover:bg-[#E04A15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isOtpComplete || isVerifying}
                onClick={async () => {
                  if (isOtpComplete) {
                    const code = otp.join("");
                    const resetToken = localStorage.getItem("resetToken");
                    
                    if (!resetToken) {
                      alert("Reset token not found. Please request a new code.");
                      router.push("/forgot-password");
                      return;
                    }

                    setIsVerifying(true);

                    try {
                      // Server currently expects a numeric token to match for resetting password
                      // This is simplified for demo - in production, this would be more secure
                      if (resetToken !== code) {
                        throw new Error("Invalid verification code");
                      }

                      // Navigate to new password page
                      router.push("/forgot-password/new-password");
                    } catch (error: any) {
                      alert(error.message || "Failed to verify code. Please try again.");
                      console.error("Error verifying OTP:", error);
                      // Clear invalid OTP
                      setOtp(["", "", "", "", "", ""]);
                      inputRefs.current[0]?.focus();
                    } finally {
                      setIsVerifying(false);
                    }
                  }
                }}
              >
                <span>{isVerifying ? "Verifying..." : "Verify"}</span>
                <ArrowRight className="w-[18px] h-[18px]" />
              </button>
            </div>

            {/* Bottom Links */}
            <div className="flex justify-center max-md:flex max-md:flex-row max-md:justify-center max-md:items-center max-md:gap-[89px] max-md:w-[319px]">
              {/* Back to Sign In Link */}
              <div className="flex justify-center max-md:flex max-md:items-center max-md:gap-2">
                <Link
                  href="/signin"
                  className="flex items-center gap-2 text-[16px] leading-[19px] max-md:text-[14px] max-md:leading-[17px] font-medium text-[#F25417] hover:text-[#E04A15] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>

              {/* Resend Code Button */}
              <button
                onClick={async () => {
                  if (!isResending) {
                    setIsResending(true);
                    try {
                      const response = await api.requestPasswordReset(
                        localStorage.getItem("resetEmail") || ""
                      );
                      localStorage.setItem("resetToken", response.resetToken);
                      alert("A new verification code has been sent to your email.");
                      // Clear current OTP
                      setOtp(["", "", "", "", "", ""]);
                      inputRefs.current[0]?.focus();
                    } catch (error: any) {
                      alert(error.message || "Failed to resend code. Please try again.");
                    } finally {
                      setIsResending(false);
                    }
                  }
                }}
                className="text-center text-[18px] leading-[28px] max-md:text-[12px] max-md:leading-[15px] text-[#F25417] hover:text-[#E04A15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isResending}
              >
                {isResending ? "Sending..." : "Didn't receive the code? Request a new one."}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
