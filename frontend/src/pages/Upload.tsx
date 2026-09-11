import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Inbox, ListX, Workflow } from "lucide-react";
import { uploadsApi, validateFile } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { UploadDropzone } from "@/components/upload/upload-dropzone";
import {
  UploadQueueItem,
  UploadSummary,
  type QueueItem,
} from "@/components/upload/upload-queue";
import { pipelineOrder, pipelineStageDescriptions, pipelineStageLabels } from "@/data/mockProcessing";
import { uid } from "@/lib/utils";

export default function UploadPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const controllers = useRef(new Map<string, AbortController>());

  const patch = useCallback((id: string, changes: Partial<QueueItem>) => {
    setQueue((current) =>
      current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  }, []);

  /** Upload, then walk the pipeline, mirroring each stage into the queue. */
  const runPipeline = useCallback(
    async (item: QueueItem) => {
      const controller = new AbortController();
      controllers.current.set(item.id, controller);

      try {
        const document = await uploadsApi.upload(item.file, {
          signal: controller.signal,
          onProgress: (progress) => patch(item.id, { progress }),
          onStatusChange: (status) => patch(item.id, { status }),
        });

        patch(item.id, {
          status: "processing",
          progress: 100,
          documentId: document.id,
          stages: document.processingStages,
        });

        const processed = await uploadsApi.process(document.id, {
          signal: controller.signal,
          onStages: (stages) => {
            const classification = stages.find((stage) => stage.id === "classification");
            patch(item.id, {
              stages,
              detectedType:
                classification?.status === "completed"
                  ? classification.detail
                  : undefined,
            });
          },
        });

        patch(item.id, {
          status: "processed",
          stages: processed.processingStages,
          error: undefined,
        });
      } catch (cause) {
        patch(item.id, {
          status: "failed",
          error:
            cause instanceof Error
              ? cause.message
              : "Procesarea nu s-a putut finaliza.",
        });
      } finally {
        controllers.current.delete(item.id);
      }
    },
    [patch],
  );

  const addFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;

      const items: QueueItem[] = files.map((file) => {
        const rejection = validateFile(file);
        return {
          id: uid("q"),
          file,
          status: rejection ? "rejected" : "waiting",
          progress: 0,
          error: rejection ?? undefined,
        };
      });

      setQueue((current) => [...current, ...items]);

      const rejected = items.filter((item) => item.status === "rejected").length;
      if (rejected > 0) {
        toast.error(
          rejected === 1 ? "1 fișier a fost respins" : `${rejected} fișiere au fost respinse`,
          { description: "Sunt acceptate doar fișiere PDF, JPG și PNG de până la 50 MB." },
        );
      }

      items
        .filter((item) => item.status === "waiting")
        .forEach((item) => void runPipeline(item));
    },
    [runPipeline],
  );

  function removeItem(id: string) {
    controllers.current.get(id)?.abort();
    controllers.current.delete(id);
    setQueue((current) => current.filter((item) => item.id !== id));
  }

  function retryItem(id: string) {
    const item = queue.find((entry) => entry.id === id);
    if (!item) return;
    patch(id, { status: "waiting", progress: 0, error: undefined, stages: undefined });
    void runPipeline({ ...item, status: "waiting", progress: 0 });
  }

  function clearFinished() {
    setQueue((current) =>
      current.filter(
        (item) => item.status !== "processed" && item.status !== "rejected",
      ),
    );
  }

  const processedCount = queue.filter((item) => item.status === "processed").length;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        title="Încarcă documente"
        description="Adaugă PDF-uri, fotografii și documente scanate. Fiecare fișier intră în fluxul de procesare imediat după încărcare."
        actions={
          processedCount > 0 && (
            <Button variant="secondary" asChild>
              <Link to="/documents">
                Vezi documentele
                <ArrowRight />
              </Link>
            </Button>
          )
        }
      />

      <UploadDropzone onFiles={addFiles} />

      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Coadă de încărcare</CardTitle>
          {queue.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFinished}>
              <ListX />
              Curăță finalizatele
            </Button>
          )}
        </CardHeader>

        {queue.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={Inbox}
              title="Nu există fișiere în coadă"
              description="Fișierele adăugate apar aici împreună cu progresul de încărcare și procesare."
              className="border-0 py-8"
            />
          </CardContent>
        ) : (
          <>
            <UploadSummary items={queue} />
            <ul className="divide-y divide-border">
              {queue.map((item) => (
                <UploadQueueItem
                  key={item.id}
                  item={item}
                  onRemove={removeItem}
                  onRetry={retryItem}
                />
              ))}
            </ul>
          </>
        )}
      </Card>

      {/* What happens next */}
      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <Workflow className="size-4 text-brand-bright" aria-hidden />
          <CardTitle>Ce se întâmplă după încărcare</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pipelineOrder.map((stage, index) => (
              <li
                key={stage}
                className="rounded-lg border border-border bg-surface-raised p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-md border border-primary-border bg-primary-subtle font-mono text-[10px] text-brand-bright">
                    {index + 1}
                  </span>
                  <p className="text-[13px] font-medium">
                    {pipelineStageLabels[stage]}
                  </p>
                </div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                  {pipelineStageDescriptions[stage]}
                </p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
