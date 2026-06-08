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
  protected?: boolean;
  comingSoon?: boolean;
}

export function LinkCard({
  title,
  description,
  href,
  icon,
  protected: isProtected,
  comingSoon,
}: LinkCardProps) {
  const Icon = iconMap[icon] ?? Package;

  if (comingSoon) {
    return (
      <div
        className="relative flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 opacity-60 cursor-default select-none"
        aria-label={`${title} — coming soon`}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
          <Icon className="h-4.5 w-4.5 text-slate-400" aria-hidden="true" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-500">{title}</p>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-400">
              Soon
            </span>
          </div>
          <p className="mt-0.5 text-sm text-slate-400">{description}</p>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5",
        "hover:border-teal-300 hover:shadow-md hover:shadow-teal-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
        "transition-all duration-150"
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 group-hover:bg-teal-100 transition-colors">
        <Icon className="h-[18px] w-[18px] text-teal-600" aria-hidden="true" />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
            {title}
          </p>
          {isProtected && (
            <Lock
              className="h-3 w-3 text-slate-400"
              aria-label="Password protected"
            />
          )}
        </div>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>

      <ArrowRight
        className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all"
        aria-hidden="true"
      />
    </Link>
  );
}
