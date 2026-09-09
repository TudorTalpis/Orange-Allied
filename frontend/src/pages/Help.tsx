import { Link } from "react-router-dom";
import { ArrowRight, Bot, Database, Plug, Search, Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/page-header";
import { ProcessingPipeline } from "@/components/processing/processing-pipeline";
import { buildStages } from "@/data/mockProcessing";
import { mockAITools } from "@/data/mockChat";
import { DynamicIcon } from "@/components/common/icon";

const retrievalModes = [
  {
    icon: Search,
    title: "Căutare clasică",
    body: "Termeni exacți potriviți în numele fișierelor, câmpurile extrase și stratul de text OCR, restrânși prin filtre structurate. Previzibilă și potrivită atunci când știi numărul facturii.",
  },
  {
    icon: Database,
    title: "Căutare semantică",
    body: "Interogarea este vectorizată și comparată cu vectorii documentelor din pgvector. Găsește documente cu același înțeles chiar dacă nu au niciun cuvânt comun — „obligații de protecție a datelor” scoate la iveală un act adițional GDPR.",
  },
  {
    icon: Bot,
    title: "Asistent AI",
    body: "Un strat de limbaj natural peste ambele. Planifică interogarea, apelează instrumentele de căutare, citește ce primește și răspunde cu citări. Folosește-l când răspunsul se întinde pe mai multe documente.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        title="Cum funcționează DocuAI"
        description="Ce se întâmplă cu un document între încărcare și răspuns."
      />

      <Card>
        <CardHeader>
          <CardTitle>Fluxul de procesare</CardTitle>
          <CardDescription>
            Fiecare document — un PDF curat sau fotografia unei chitanțe — trece
            prin aceleași șase etape.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProcessingPipeline stages={buildStages(6)} />
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-3">
        {retrievalModes.map((mode) => (
          <Card key={mode.title} className="p-4">
            <span
              className="flex size-8 items-center justify-center rounded-lg border border-primary-border bg-primary-subtle text-brand-bright"
              aria-hidden
            >
              <mode.icon className="size-4" />
            </span>
            <h2 className="mt-3 text-[13.5px] font-semibold">{mode.title}</h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
              {mode.body}
            </p>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="size-4 text-brand-bright" aria-hidden />
            Instrumentele pe care le poate folosi asistentul
          </CardTitle>
          <CardDescription>
            Asistentul nu are acces liber la datele tale. Ajunge la colecție
            printr-un set fix de instrumente ale aplicației, fiecare cu un scop
            declarat — același contract pe care backendul îl expune prin
            Model Context Protocol.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {mockAITools.map((tool) => (
              <li
                key={tool.id}
                className="flex items-start gap-2.5 rounded-lg border border-border bg-surface-raised p-3"
              >
                <DynamicIcon
                  name={tool.icon}
                  className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                />
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[13px] font-medium">
                    {tool.name}
                    {!tool.enabled && <Badge variant="outline">Oprit</Badge>}
                  </p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                    {tool.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Despre această versiune</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-[13px] leading-relaxed text-muted-foreground">
          <p>
            Acesta este frontendul unui proiect de Practică Tehnologică. Toate
            ecranele sunt complete, dar încă nu există un backend: OCR,
            clasificarea, extragerea, embedding-urile și asistentul sunt servite
            de un strat simulat, ținut în memorie, aflat în{" "}
            <code className="font-mono text-[12px] text-foreground">src/api/</code>.
          </p>
          <p>
            Fiecare modul de serviciu are deja forma reală a endpointului. Setând{" "}
            <code className="font-mono text-[12px] text-foreground">
              VITE_USE_MOCK_API=false
            </code>{" "}
            și îndreptând{" "}
            <code className="font-mono text-[12px] text-foreground">VITE_API_URL</code>{" "}
            către serviciul FastAPI, aceleași apeluri trec prin HTTP, fără nicio
            modificare în componente.
          </p>
          <Button variant="secondary" asChild className="mt-1">
            <Link to="/upload">
              <Upload />
              Încearcă să încarci un document
              <ArrowRight />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
