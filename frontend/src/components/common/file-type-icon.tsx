import { FileText, FileType2, Image as ImageIcon } from "lucide-react";
import type { DocumentFileType } from "@/types";
import { cn } from "@/lib/utils";

const styles: Record<DocumentFileType, string> = {
  pdf: "border-primary-border bg-primary-subtle text-[#E4899B]",
  image: "border-info-border bg-info-muted text-info",
  docx: "border-info-border bg-info-muted text-[#7FB3F5]",
};

const icons: Record<DocumentFileType, typeof FileText> = {
  pdf: FileText,
  image: ImageIcon,
  docx: FileType2,
};

export function FileTypeIcon({
  type,
  className,
  size = "md",
}: {
  type: DocumentFileType;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = icons[type];
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg border",
        styles[type],
        size === "sm" && "size-7",
        size === "md" && "size-9",
        size === "lg" && "size-11",
        className,
      )}
      aria-hidden
    >
      <Icon
        className={cn(
          size === "sm" && "size-3.5",
          size === "md" && "size-4",
          size === "lg" && "size-5",
        )}
      />
    </span>
  );
}
