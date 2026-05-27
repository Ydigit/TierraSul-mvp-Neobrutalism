import { RequireRole } from "@/components/auth/require-role";

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireRole role="operator">{children}</RequireRole>;
}
