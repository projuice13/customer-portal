import Link from "next/link";
import {
  Home,
  Package,
  MessageCircle,
  Calculator,
  Truck,
  Download,
  FileText,
  HelpCircle,
  MapPin,
  Lock,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Home,
  Package,
  MessageCircle,
  Calculator,
  Truck,
  Download,
  FileText,
  HelpCircle,
  MapPin,
};

interface LinkCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  image?: string;
  protected?: boolean;
  comingSoon?: boolean;
  beta?: boolean;
}

export function LinkCard({
  title,
  description,
  href,
  icon,
  image = "/smoothie.jpg",
  protected: isProtected,
  comingSoon,
  beta,
}: LinkCardProps) {
  const Icon = iconMap[icon] ?? Package;

  const cardBase = cn(
    "relative overflow-hidden rounded-xl",
    "min-h-[450px] flex flex-col justify-end",
    "bg-slate-800"
  );

  const bgStyle = {
    backgroundImage: `url(${image})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const overlay = (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)",
      }}
    />
  );

  if (comingSoon) {
    return (
      <div className={cn(cardBase, "opacity-60 cursor-default select-none")} style={bgStyle} aria-label={`${title} — coming soon`}>
        {overlay}
        <div className="relative z-10 p-5">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[20px] font-bold uppercase tracking-wide text-white">{title}</p>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white/80">
              Soon
            </span>
          </div>
          <p className="text-sm text-white/70">{description}</p>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        cardBase,
        "group",
        "hover:shadow-xl hover:shadow-black/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2",
        "transition-all duration-200"
      )}
      style={bgStyle}
    >
      {overlay}

      <div className="relative z-10 p-5">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[20px] font-bold uppercase tracking-wide text-white">{title}</p>
          {isProtected && (
            <Lock className="h-4 w-4 text-white/70" aria-label="Password protected" />
          )}
          {beta && (
            <span className="rounded-full bg-amber-400/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950">
              Beta
            </span>
          )}
        </div>
        <p className="text-sm text-white/80">{description}</p>
      </div>

      <ArrowRight
        className="absolute right-4 bottom-5 h-4 w-4 text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all z-10"
        aria-hidden="true"
      />
    </Link>
  );
}
