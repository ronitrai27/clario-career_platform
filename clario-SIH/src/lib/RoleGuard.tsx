// components/RoleGuard.tsx
'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RoleGuard({
  children,
  allowedRoles = ["mentor"],
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const { data: authData, error } = await supabase.auth.getUser();
      const role = authData?.user?.user_metadata?.role;

      console.log("🔐 RoleGuard: user role =", role);

      if (!role || !allowedRoles.includes(role)) {
        router.replace("/unauthorized");
      } else {
        setLoading(false);
      }
    };

    checkRole();
  }, [allowedRoles, router, supabase]);

  if (loading) return <div className="p-6">Checking access...</div>;

  return <>{children}</>;
}
