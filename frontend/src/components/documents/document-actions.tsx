import { useNavigate } from "react-router-dom";
import {
  Download,
  Eye,
  FolderInput,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Document } from "@/types";

export interface DocumentActionHandlers {
  onPreview?: (doc: Document) => void;
  onRename?: (doc: Document) => void;
  onMove?: (doc: Document) => void;
  onDelete?: (doc: Document) => void;
  onReprocess?: (doc: Document) => void;
  onDownload?: (doc: Document) => void;
}

export function DocumentActions({
  document,
  handlers,
  align = "end",
}: {
  document: Document;
  handlers: DocumentActionHandlers;
  align?: "start" | "end";
}) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Acțiuni pentru ${document.name}`}
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} onClick={(event) => event.stopPropagation()}>
        <DropdownMenuItem onSelect={() => navigate(`/documents/${document.id}`)}>
          <Eye />
          Deschide
        </DropdownMenuItem>
        {handlers.onPreview && (
          <DropdownMenuItem onSelect={() => handlers.onPreview?.(document)}>
            <Eye />
            Previzualizare rapidă
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => handlers.onDownload?.(document)}>
          <Download />
          Descarcă
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => handlers.onRename?.(document)}>
          <Pencil />
          Redenumește
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handlers.onMove?.(document)}>
          <FolderInput />
          Mută în categorie
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handlers.onReprocess?.(document)}>
          <RefreshCw />
          Procesează din nou
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={() => handlers.onDelete?.(document)}>
          <Trash2 />
          Șterge
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
