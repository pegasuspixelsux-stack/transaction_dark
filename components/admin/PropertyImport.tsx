"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { useAdmin } from "@/lib/admin/admin-context";
import type { PropertyImportSummary } from "@/types/admin";
import { Button, Modal } from "./ui";

const TEMPLATE_URL = "/templates/inventory-import-sample.xlsx";

type State =
  | { phase: "idle" }
  | { phase: "working"; label: string }
  | { phase: "preview"; file: File; summary: PropertyImportSummary }
  | { phase: "done"; summary: PropertyImportSummary }
  | { phase: "error"; message: string };

export function PropertyImport({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { importProperties } = useAdmin();
  const [state, setState] = useState<State>({ phase: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  function close() {
    setState({ phase: "idle" });
    if (inputRef.current) inputRef.current.value = "";
    onClose();
  }

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setState({ phase: "working", label: "Revisando el archivo…" });
    const result = await importProperties(file, false);
    if (!result.ok) return setState({ phase: "error", message: result.error });
    setState({ phase: "preview", file, summary: result });
  }

  async function confirm(file: File) {
    setState({ phase: "working", label: "Importando…" });
    const result = await importProperties(file, true);
    if (!result.ok) return setState({ phase: "error", message: result.error });
    setState(result.saved ? { phase: "done", summary: result } : { phase: "preview", file, summary: result });
  }

  const reset = () => {
    setState({ phase: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Modal open={open} onClose={close} title="Importar propiedades desde Excel" wide>
      <div className="space-y-5">
        <p className="text-sm text-admin-muted">
          Subí un archivo .xlsx con el formato de la plantilla. Las filas con un <strong>id</strong> existente actualizan esa
          propiedad; las demás crean propiedades nuevas. Si alguna fila tiene errores, no se importa nada.
        </p>

        <a
          href={TEMPLATE_URL}
          download
          className="inline-flex min-h-11 items-center gap-2 text-sm text-admin-ink underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent"
        >
          <Download className="size-4" aria-hidden /> Descargar plantilla de ejemplo
        </a>

        {state.phase === "idle" || state.phase === "error" ? (
          <div>
            <label
              htmlFor="inventory-file"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-admin-line px-4 py-8 text-center text-admin-muted transition-colors hover:bg-admin-panel-strong focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-admin-accent"
            >
              <FileSpreadsheet className="size-6" aria-hidden />
              <span className="text-sm">Elegir archivo .xlsx (hasta 2 MB y 500 filas)</span>
            </label>
            <input
              ref={inputRef}
              id="inventory-file"
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={onPick}
              className="sr-only"
            />
          </div>
        ) : null}

        <div aria-live="polite">
          {state.phase === "working" ? <p className="text-sm text-admin-muted">{state.label}</p> : null}
          {state.phase === "error" ? (
            <p role="alert" className="text-sm text-admin-bad">{state.message}</p>
          ) : null}

          {state.phase === "preview" ? (
            <div className="space-y-4">
              <p className="text-sm text-admin-ink">
                {state.summary.created} nueva{state.summary.created === 1 ? "" : "s"} · {state.summary.updated} actualizada
                {state.summary.updated === 1 ? "" : "s"}
              </p>
              {state.summary.errors.length > 0 ? (
                <>
                  <p role="alert" className="text-sm text-admin-bad">
                    Encontramos {state.summary.errors.length} fila{state.summary.errors.length === 1 ? "" : "s"} con errores. No
                    se importó nada: corregí el archivo y volvé a subirlo.
                  </p>
                  <ul className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-admin-line p-3 text-sm">
                    {state.summary.errors.map((err) => (
                      <li key={`${err.row}-${err.error}`}>
                        <span className="text-admin-ink">Fila {err.row}{err.title ? ` · ${err.title}` : ""}:</span>{" "}
                        <span className="text-admin-bad">{err.error}</span>
                      </li>
                    ))}
                  </ul>
                  <Button onClick={reset}>Elegir otro archivo</Button>
                </>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" onClick={() => confirm(state.file)}>
                    Importar {state.summary.created + state.summary.updated} propiedades
                  </Button>
                  <Button onClick={reset}>Cancelar</Button>
                </div>
              )}
            </div>
          ) : null}

          {state.phase === "done" ? (
            <div className="space-y-4">
              <p className="text-sm text-admin-ok">
                Importación completada: {state.summary.created} creada{state.summary.created === 1 ? "" : "s"} y{" "}
                {state.summary.updated} actualizada{state.summary.updated === 1 ? "" : "s"}.
              </p>
              <Button variant="primary" onClick={close}>Listo</Button>
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
