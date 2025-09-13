"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Button from "../components/Button";

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);

  return (
    <div className="h-[1024px] max-lg:h-fit max-lg:p-4 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
      <main className="max-w-[1440px] mx-auto lg:pr-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_608px] gap-6">
          {/* Left visual panel */}
          <div className="relative h-[360px] max-lg:hidden lg:h-[1024px]">
            <Image
              src="/signup.png"
              alt="GridSpace inspiration"
              width={800}
              height={800}
              className="object-cover w-full h-full"
            />
            {/* Bottom overlay card */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-30 lg:w-[70%] xl:h-[196px] bg-[rgba(242,84,23,0.10)] border border-[rgba(242,84,23,0.33)] rounded-lg backdrop-blur-md">
              <div className="h-full px-4 py-4 lg:py-[20px] flex flex-col justify-center items-center text-center">
                <h3 className="text-[20px] lg:text-[28px] leading-[28px] xl:leading-[48px] font-bold text-[var(--color-text-light)]">
                  Join the future of{" "}
                  <span className="text-[var(--color-primary)]">
                    flexible work
                  </span>
                </h3>
                <p className="mt-1 text-[14px] lg:text-[16px] leading-[21px] tracking-[0.5px] text-[var(--color-text-light)]/90">
                  Connect with thousands of verified workspaces and productive
                  professionals
                </p>
              </div>
            </div>
          </div>

          {/* Right form card */}
          <div className="bg-white border border-[rgba(0,47,91,0.19)] max-sm:w-[100%] max-lg:max-w-[608px] max-lg:h-fit max-lg:mx-auto rounded-lg shadow-[0_4px_4px_5px_rgba(231,230,230,0.25)] p-5 sm:p-7 md:p-8 lg:p-10 my-auto h-[950px]">
            <div className="flex flex-col items-center mb-8 gap-1">
              <h1 className="text-[16px] md:text-[28px] leading-[19px] md:leading-[38px] font-bold text-[var(--color-secondary)] text-center">
                Create your GridSpace Account
              </h1>
              <p className="text-[14px] md:text-[16px] leading-6 tracking-[0.5px] text-[var(--color-text-secondary)] text-center">
                Join thousands of professionals finding flexible work spaces
              </p>
            </div>

            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                const rules = {
                  length: password.length >= 8,
                  upper: /[A-Z]/.test(password),
                  number: /\d/.test(password),
                  special: /[^A-Za-z0-9]/.test(password),
                };
                const passwordValid =
                  rules.length && rules.upper && rules.number && rules.special;
                const digits = phone.replace(/\D/g, "");
                const phoneValid = digits.length >= 10 && digits.length <= 15;
                if (!passwordValid || !phoneValid || !agree) return;
                // TODO: Submit form data
                // Redirect to onboarding after successful signup
                router.push("/onboarding");
              }}
            >
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-[16px] md:text-[18px] font-medium">
                  Full Name
                </label>
                <div className="flex items-center gap-3 h-[56px] sm:h-[60px] px-3 border border-[var(--color-border)] rounded-lg bg-white">
                  <User className="w-5 h-5 text-[#9CA3AF]" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="flex-1 max-sm:w-[50%] outline-none placeholder:text-[#9CA3AF] text-[14px] md:text-[16px]"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[16px] md:text-[18px] font-medium">
                  Email Address
                </label>
                <div className="flex items-center gap-3 h-[56px] sm:h-[60px] px-3 border border-[var(--color-border)] rounded-lg bg-white">
                  <Mail className="w-5 h-5 text-[#9CA3AF]" />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 max-sm:w-[50%] outline-none placeholder:text-[#9CA3AF] text-[14px] md:text-[16px]"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-[16px] md:text-[18px] font-medium">
                  Phone Number
                </label>
                <div className="flex items-center gap-3 h-[56px] sm:h-[60px] px-3 border border-[var(--color-border)] rounded-lg bg-white">
                  <Phone className="w-5 h-5 text-[#9CA3AF]" />
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="flex-1 max-sm:w-[50%] outline-none placeholder:text-[#9CA3AF] text-[14px] md:text-[16px]"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    pattern="[+()\-\s\d]{10,20}"
                    aria-invalid={
                      phone.replace(/\D/g, "").length < 10 ||
                      phone.replace(/\D/g, "").length > 15
                        ? true
                        : undefined
                    }
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[16px] md:text-[18px] font-medium">
                  Password
                </label>
                <div className="flex items-center justify-between gap-3 h-[56px] sm:h-[60px] px-3 border border-[#9CA3AF] rounded-lg bg-white">
                  <div className="flex items-center gap-3 flex-1">
                    <Lock className="w-5 h-5 text-[#9CA3AF]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      className="flex-1 outline-none max-sm:w-[50%] placeholder:text-[#9CA3AF] text-[14px] md:text-[16px]"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={
                        !(
                          /[A-Z]/.test(password) &&
                          /\d/.test(password) &&
                          /[^A-Za-z0-9]/.test(password) &&
                          password.length >= 8
                        )
                          ? true
                          : undefined
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-sm text-gray-500 hover:text-gray-700 px-2"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {/* Password requirements */}
                <div className="flex flex-wrap items-start gap-[20px] mt-2 text-[14px]">
                  {[
                    { label: "8+ characters", met: password.length >= 8 },
                    { label: "Uppercase", met: /[A-Z]/.test(password) },
                    { label: "Number", met: /\d/.test(password) },
                    {
                      label: "Special char",
                      met: /[^A-Za-z0-9]/.test(password),
                    },
                  ].map((req) => (
                    <div
                      key={req.label}
                      className="flex items-center gap-1 h-6 min-h-[14px]"
                    >
                      {req.met ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span
                        className={req.met ? "text-green-700" : "text-red-600"}
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agreement */}
              <div className="flex items-center gap-2">
                <input
                  id="agree"
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="w-4 h-4 border border-[var(--color-border)] rounded-sm accent-[var(--color-primary)]"
                  required
                />
                <label htmlFor="agree" className="text-[13px]">
                  I agree to{" "}
                  <Link href="#" className="text-blue">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-blue">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={(() => {
                  const rules = {
                    length: password.length >= 8,
                    upper: /[A-Z]/.test(password),
                    number: /\d/.test(password),
                    special: /[^A-Za-z0-9]/.test(password),
                  };
                  const passwordValid =
                    rules.length &&
                    rules.upper &&
                    rules.number &&
                    rules.special;
                  const digits = phone.replace(/\D/g, "");
                  const phoneValid = digits.length >= 10 && digits.length <= 15;
                  return !passwordValid || !phoneValid || !agree;
                })()}
              >
                Sign Up
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-2 text-[16px] text-[#5A5959]">
                <span className="flex-1 h-px bg-[#9CA3AF]" />
                <span className="max-md:text-[14px]">Or continue with</span>
                <span className="flex-1 h-px bg-[#9CA3AF]" />
              </div>

              {/* Social buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button className="h-[56px] sm:h-[60px] rounded-lg border border-[var(--color-secondary)] flex items-center justify-center gap-2">
                  <Image
                    src="/google.png"
                    alt="Google"
                    width={22}
                    height={22}
                  />
                  <span className="text-[16px]">Google</span>
                </button>
                <button className="h-[56px] sm:h-[60px] rounded-lg border border-[var(--color-secondary)] flex items-center justify-center gap-2">
                  <Image
                    src="/facebook.png"
                    alt="Facebook"
                    width={24}
                    height={24}
                  />
                  <span className="text-[16px]">Facebook</span>
                </button>
                <button className="h-[56px] sm:h-[60px] rounded-lg border border-[var(--color-secondary)] flex items-center justify-center gap-2">
                  <Image src="/apple.png" alt="Apple" width={30} height={30} />
                  <span className="text-[16px]">Apple</span>
                </button>
              </div>

              <p className="text-center text-xs md:text-sm">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="text-[var(--color-primary)] font-medium hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
