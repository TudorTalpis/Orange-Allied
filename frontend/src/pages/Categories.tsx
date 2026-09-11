import { useState } from "react";
import { toast } from "sonner";
import { FolderPlus, FolderTree } from "lucide-react";
import { categoriesApi } from "@/api";
import { useAsync } from "@/hooks/useAsync";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingCards } from "@/components/common/loading-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { CategoryCard } from "@/components/categories/category-card";
import { CategoryDialog } from "@/components/categories/category-dialog";
import type { CreateCategoryPayload, DocumentCategory } from "@/types";

export default function CategoriesPage() {
  const request = useAsync(() => categoriesApi.list(), []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DocumentCategory | null>(null);
  const [deleting, setDeleting] = useState<DocumentCategory | null>(null);

  async function handleSubmit(payload: CreateCategoryPayload) {
    if (editing) {
      await categoriesApi.update(editing.id, payload);
      toast.success("Categoria a fost actualizată");
    } else {
      await categoriesApi.create(payload);
      toast.success("Categoria a fost creată");
    }
    request.reload();
  }

  const categories = request.data ?? [];
  const totalDocuments = categories.reduce(
    (sum, category) => sum + category.documentCount,
    0,
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title="Categorii"
        description={
          categories.length > 0
            ? `${categories.length} categorii care acoperă ${totalDocuments.toLocaleString("ro-RO")} documente.`
            : "Grupează documentele în colecții potrivite modului tău de lucru."
        }
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <FolderPlus />
            Creează categorie
          </Button>
        }
      />

      {request.loading && (
        <LoadingCards
          count={8}
          className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        />
      )}

      {request.error && (
        <ErrorState
          title="Categoriile nu au putut fi încărcate"
          message={request.error}
          onRetry={request.reload}
        />
      )}

      {!request.loading && !request.error && categories.length === 0 && (
        <EmptyState
          icon={FolderTree}
          title="Nu există categorii încă"
          description="Creează prima categorie pentru a organiza colecția — facturi, contracte, chitanțe sau orice se potrivește fluxului tău de lucru."
          action={
            <Button variant="primary" onClick={() => setDialogOpen(true)}>
              <FolderPlus />
              Creează categorie
            </Button>
          }
        />
      )}

      {categories.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <li key={category.id}>
              <CategoryCard
                category={category}
                onEdit={(item) => {
                  setEditing(item);
                  setDialogOpen(true);
                }}
                onDelete={setDeleting}
              />
            </li>
          ))}
        </ul>
      )}

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={() => setDeleting(null)}
        title={`Ștergi „${deleting?.name}”?`}
        description="Documentele din interior sunt păstrate, dar devin neclasificate. Această acțiune nu poate fi anulată."
        confirmLabel="Șterge categoria"
        destructive
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await categoriesApi.remove(deleting.id);
            toast.success("Categoria a fost ștearsă");
            request.reload();
          } catch (cause) {
            toast.error("Categoria nu a putut fi ștearsă", {
              description: cause instanceof Error ? cause.message : undefined,
            });
          }
        }}
      />
    </div>
  );
}
