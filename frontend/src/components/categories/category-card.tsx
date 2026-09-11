import { Link } from "react-router-dom";
import { ArrowRight, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DynamicIcon } from "@/components/common/icon";
import type { DocumentCategory } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

export function CategoryCard({
  category,
  onEdit,
  onDelete,
}: {
  category: DocumentCategory;
  onEdit: (category: DocumentCategory) => void;
  onDelete: (category: DocumentCategory) => void;
}) {
  return (
    <Card interactive className="group relative flex flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <span
          className="flex size-9 items-center justify-center rounded-lg border"
          style={{
            backgroundColor: `${category.color}1A`,
            borderColor: `${category.color}40`,
            color: category.color,
          }}
          aria-hidden
        >
          <DynamicIcon name={category.icon} className="size-4" />
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Acțiuni pentru ${category.name}`}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(category)}>
              <Pencil />
              Redenumește
            </DropdownMenuItem>
            <DropdownMenuItem
              destructive
              disabled={category.system}
              onSelect={() => onDelete(category)}
            >
              <Trash2 />
              Șterge
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <h3 className="text-[14px] font-semibold tracking-tight">{category.name}</h3>
        {category.system && <Badge variant="outline">Sistem</Badge>}
      </div>

      {category.description && (
        <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
          {category.description}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <div>
          <p className="text-lg font-semibold tabular-nums">
            {category.documentCount.toLocaleString()}
          </p>
          <p className="text-[11px] text-subtle-foreground">
            documente · actualizat {formatRelativeTime(category.updatedAt)}
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/documents?category=${category.id}`}>
            Deschide
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
