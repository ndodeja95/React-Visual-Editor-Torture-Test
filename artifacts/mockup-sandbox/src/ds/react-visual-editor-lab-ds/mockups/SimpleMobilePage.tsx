import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, FileText, Plus, Radio, Sparkles } from "lucide-react";
import { LabButton } from "@workspace/react-visual-editor-lab-ds/components/ui/lab-button";
import { LabCard } from "@workspace/react-visual-editor-lab-ds/components/ui/lab-card";
import { LabInput } from "@workspace/react-visual-editor-lab-ds/components/ui/lab-input";
import { SourceChip } from "@workspace/react-visual-editor-lab-ds/components/ui/source-chip";
import { StatusDot } from "@workspace/react-visual-editor-lab-ds/components/ui/status-dot";

type NoteStatus = "Mapped" | "Draft" | "Review";

type Note = {
  id: string;
  title: string;
  source: string;
  status: NoteStatus;
  time: string;
};

const starterNotes: Note[] = [
  {
    id: "FN-023",
    title: "Button source contract",
    source: "button[data-variant]",
    status: "Mapped",
    time: "12 min ago",
  },
  {
    id: "FN-022",
    title: "Empty state anatomy",
    source: "section.empty-state",
    status: "Review",
    time: "Yesterday",
  },
  {
    id: "FN-021",
    title: "Mobile card spacing",
    source: "article.test-card",
    status: "Draft",
    time: "Mar 08",
  },
];

const statusTone: Record<NoteStatus, string> = {
  Mapped: "text-primary",
  Draft: "text-muted-foreground",
  Review: "text-primary",
};

export function SimpleMobilePage() {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState(starterNotes);
  const [captured, setCaptured] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    const nextNumber = String(notes.length + 24).padStart(3, "0");
    setNotes((current) => [
      {
        id: `FN-${nextNumber}`,
        title: cleanTitle,
        source: "pending source mapping",
        status: "Draft",
        time: "Just now",
      },
      ...current,
    ]);
    setTitle("");
    setCaptured(true);
    window.setTimeout(() => setCaptured(false), 2400);
  }

  return (
    <main className="dark min-h-[100dvh] bg-background text-foreground">
      <div className="ds-grid-paper min-h-[100dvh]">
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-8">
          <header className="flex items-center justify-between border-b border-border py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                <FileText size={17} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Source-aware lab
                </p>
                <h1 className="text-lg font-semibold tracking-tight">Field Notes</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
              <StatusDot live aria-label="Lab live" />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Live
              </span>
            </div>
          </header>

          <section className="pt-8">
            <p className="ds-eyebrow mb-3">Capture a clean mapping</p>
            <h2 className="max-w-xs text-3xl font-semibold leading-tight tracking-tight">
              Make the source speak for itself.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              Start a field note when you find a pattern worth preserving. Keep the
              source close, the intent clear, and the handoff easy.
            </p>
          </section>

          <LabCard className="mt-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Sparkles size={15} aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold">New field note</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Give your observation a useful handle before mapping the source.
                </p>
              </div>
              <SourceChip>NOTE / 024</SourceChip>
            </div>

            <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
              <label className="block" htmlFor="note-title">
                <span className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Note title
                </span>
                <LabInput
                  id="note-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Source chip hierarchy"
                  autoComplete="off"
                  aria-describedby="note-help"
                />
              </label>
              <div className="flex items-center justify-between gap-3">
                <span id="note-help" className="text-[11px] leading-4 text-muted-foreground">
                  You can map the source next.
                </span>
                <LabButton
                  type="submit"
                  variant="primary"
                  className="min-h-11 shrink-0 px-4 text-sm font-medium"
                  disabled={!title.trim()}
                >
                  {captured ? <Check size={15} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
                  {captured ? "Captured" : "Capture note"}
                </LabButton>
              </div>
            </form>
          </LabCard>

          <section className="mt-9" aria-labelledby="recent-notes-heading">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="ds-eyebrow mb-1">Your trail</p>
                <h2 id="recent-notes-heading" className="text-xl font-semibold tracking-tight">
                  Recent notes
                </h2>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{notes.length} total</span>
            </div>

            <div className="space-y-2">
              {notes.map((note) => (
                <LabCard key={note.id} className="p-3.5">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded border border-border bg-muted/60 text-muted-foreground">
                      <Radio size={13} aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate text-sm font-medium">{note.title}</h3>
                        <ArrowUpRight size={15} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <SourceChip>{note.id}</SourceChip>
                        <span className="font-mono text-xs text-muted-foreground">{note.time}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-1.5">
                        <StatusDot live={note.status === "Mapped"} aria-label={`${note.status} status`} />
                        <span className={`font-mono text-xs uppercase tracking-widest ${statusTone[note.status]}`}>
                          {note.status}
                        </span>
                        <span className="ml-auto truncate font-mono text-xs text-muted-foreground">
                          {note.source}
                        </span>
                      </div>
                    </div>
                  </div>
                </LabCard>
              ))}
            </div>
          </section>

          <footer className="mt-auto flex items-center gap-2 pt-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>Mapping station 01</span>
            <span className="h-px flex-1 bg-border" />
          </footer>
        </div>
      </div>
    </main>
  );
}