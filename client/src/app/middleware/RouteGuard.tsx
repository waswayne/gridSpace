"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export default function RouteGuard({
  children,
  allowedRoles = [],
  redirectTo = "/signin",
}: RouteGuardProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }

    // If roles are specified, check if user has required role
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role.toLowerCase())) {
      // Redirect to appropriate dashboard based on role
      switch (user.role.toLowerCase()) {
        case "admin":
          router.push("/admin-dashboard");
          break;
        case "host":
          router.push("/host-dashboard");
          break;
        default:
          router.push("/dashboard");
          break;
      }
    }
  }, [isClient, isAuthenticated, user, allowedRoles, router]);

  // Don't render anything until we're on the client
  if (!isClient) {
    return null;
  }

  // Show nothing while checking auth
  if (!isAuthenticated || (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role.toLowerCase()))) {
    return null;
  }

  return <>{children}</>;
}