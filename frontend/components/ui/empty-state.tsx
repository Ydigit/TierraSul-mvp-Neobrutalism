import { BrutalButton } from "./brutal-button";

interface EmptyStateProps {
  title: string;
  description?: string;
  cta?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  cta,
  icon,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`bg-white border-4 border-black p-12 shadow-[8px_8px_0_#000] text-center ${className}`}
    >
      {icon && <div className="flex justify-center mb-6">{icon}</div>}
      <h3 className="text-3xl font-black uppercase mb-3">{title}</h3>
      {description && (
        <p className="font-medium max-w-md mx-auto mb-8">{description}</p>
      )}
      {cta && (
        <div className="inline-block">
          {cta.href ? (
            <BrutalButton href={cta.href} variant="primary" size="lg">
              {cta.label}
            </BrutalButton>
          ) : (
            <BrutalButton variant="primary" size="lg" onClick={cta.onClick}>
              {cta.label}
            </BrutalButton>
          )}
        </div>
      )}
    </div>
  );
}
