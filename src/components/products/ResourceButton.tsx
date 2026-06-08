import { FileText, Image, Download, FileDown, Package } from "lucide-react";
import type { Resource, ResourceType } from "@/lib/types";
import { cn } from "@/lib/utils";

const resourceConfig: Record<
  ResourceType,
  { icon: React.ElementType; colour: string; bg: string }
> = {
  "spec-sheet": {
    icon: FileText,
    colour: "text-slate-600",
    bg: "bg-slate-50 border-slate-200 hover:bg-slate-100",
  },
  poster: {
    icon: Image,
    colour: "text-teal-600",
    bg: "bg-teal-50 border-teal-200 hover:bg-teal-100",
  },
  "high-res-image": {
    icon: Download,
    colour: "text-blue-600",
    bg: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
  "day-card": {
    icon: FileDown,
    colour: "text-violet-600",
    bg: "bg-violet-50 border-violet-200 hover:bg-violet-100",
  },
  pdf: {
    icon: FileText,
    colour: "text-orange-600",
    bg: "bg-orange-50 border-orange-200 hover:bg-orange-100",
  },
  "image-pack": {
    icon: Package,
    colour: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
  },
};

interface ResourceButtonProps {
  resource: Resource;
}

export function ResourceButton({ resource }: ResourceButtonProps) {
  const config = resourceConfig[resource.type];
  const Icon = config?.icon ?? FileText;
  const colour = config?.colour ?? "text-slate-600";
  const bg = config?.bg ?? "bg-slate-50 border-slate-200 hover:bg-slate-100";

  // External URLs (e.g. PDFs hosted on the main site) open in a new tab
  const isExternal = resource.url.startsWith("http");

  return (
    <a
      href={resource.url}
      {...(isExternal
        ? { target: "_blank", rel: "noopener noreferrer" }
        : { download: true })}
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1",
        bg
      )}
      aria-label={`Download ${resource.label} (${resource.fileType})`}
    >
      <Icon className={cn("h-4 w-4 flex-shrink-0", colour)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-700">
          {resource.label}
        </p>
      </div>
      <span className="flex-shrink-0 rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 border border-slate-200">
        {resource.fileType}
      </span>
    </a>
  );
}
