"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function NewPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) return;
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Handle password reset API call
      console.log("Setting new password:", password);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to success page after successful password reset
      router.push("/forgot-password/success");
    } catch (error) {
      console.error("Error setting new password:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    password && confirmPassword && password === confirmPassword;

  return (
    <div className="min-h-screen bg-[#F7F5F5] flex items-center justify-center p-4">
      <div className="w-full max-w-[1240px] h-[950px] max-md:w-full max-md:h-[810px] max-md:mx-4 max-md:relative max-md:top-[calc(50%-810px/2+17px)] bg-white border border-[rgba(0,47,91,0.19)] rounded-lg shadow-[0_4px_4px_5px_rgba(231,230,230,0.25)] flex items-center justify-center">
        <div className="w-full max-w-[532px] max-md:max-w-[372px] max-md:px-0 flex flex-col items-center gap-8 max-md:gap-8">
          {/* Header Section */}
          <div className="flex flex-col items-center gap-2 max-md:gap-0 max-md:w-[354px] max-md:h-[86px]">
            <h1 className="text-[28px] leading-[38px] max-md:text-[20px] max-md:leading-[38px] font-bold text-[#002F5B] text-center max-md:w-[215px] max-md:h-[38px]">
              Create New Password
            </h1>
            <p className="text-[18px] leading-[24px] max-md:text-[16px] max-md:leading-[24px] text-[#686767] text-center tracking-[0.5px] max-w-[472px] max-md:max-w-[354px] max-md:h-[48px]">
              Please enter a new password. It must be different from your
              previous password
            </p>
          </div>

          {/* Form Section */}
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col gap-6 max-md:w-[372px] max-md:h-[258px] max-md:flex max-md:flex-col max-md:items-center max-md:gap-6"
          >
            {/* Password Input */}
            <div className="flex flex-col gap-2 max-md:gap-2">
              <label className="text-[18px] leading-[21px] font-medium text-[#121212]">
                Password
              </label>
              <div className="flex items-center gap-3 h-[60px] px-3 border border-[#D1D5DB] rounded-lg bg-white">
                <Lock className="w-6 h-6 text-[#9CA3AF]" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  className="flex-1 outline-none placeholder:text-[#9CA3AF] text-[16px]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-6 h-6" />
                  ) : (
                    <Eye className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="flex flex-col gap-2 max-md:gap-2">
              <label className="text-[18px] leading-[21px] font-medium text-[#121212]">
                Password
              </label>
              <div className="flex items-center gap-3 h-[60px] px-3 border border-[#D1D5DB] rounded-lg bg-white">
                <Lock className="w-6 h-6 text-[#9CA3AF]" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  className="flex-1 outline-none placeholder:text-[#9CA3AF] text-[16px]"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-6 h-6" />
                  ) : (
                    <Eye className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="w-full max-md:max-w-[372px]">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full h-[60px] max-md:h-[48px] bg-[#F25417] rounded-lg flex items-center justify-center text-white text-[18px] leading-[24px] max-md:text-[16px] font-medium hover:bg-[#E04A15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Setting Password..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
