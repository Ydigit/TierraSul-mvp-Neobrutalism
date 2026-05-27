import { BrutalBadge } from "./brutal-badge";

export type TourStatus = "open" | "closed" | "expired" | "cancelled" | "completed" | "draft";
export type UserStatus = "active" | "banned";
export type SubStatus = "active" | "trialing" | "past_due" | "cancelled" | "ended";
export type DealStatus = "paid" | "pending" | "failed";

interface StatusBadgeProps {
  status: TourStatus | UserStatus | SubStatus | DealStatus | string;
  className?: string;
}

// Map to BrutalBadge variants. Default to white when unknown.
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant: React.ComponentProps<typeof BrutalBadge>["variant"] = (() => {
    switch (status) {
      case "open":
      case "active":
      case "paid":
      case "trialing":
        return "lime";
      case "closed":
      case "completed":
        return "cyan";
      case "expired":
      case "draft":
      case "ended":
      case "pending":
        return "white";
      case "cancelled":
      case "banned":
      case "past_due":
      case "failed":
        return "red";
      default:
        return "yellow";
    }
  })();

  return (
    <BrutalBadge variant={variant} className={className}>
      {String(status).toUpperCase()}
    </BrutalBadge>
  );
}
