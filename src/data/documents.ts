// Document registry. Bodies are pulled verbatim from documents.txt.

export type DocId =
  | "DOC-01" | "DOC-02" | "DOC-03" | "DOC-04"
  | "DOC-05" | "DOC-06" | "DOC-07" | "DOC-08"
  | "DOC-09" | "DOC-10" | "DOC-11" | "DOC-12"
  | "DOC-13" | "DOC-14"
  | "DOC-15"
  | "ARCH-08" | "ARCH-09" | "ARCH-10";

export type Doc = {
  id: DocId;
  title: string;
  batch: 1 | 2 | 3 | 4 | 99;
  optional?: boolean;
  content: string;
};

import { DOC_01, DOC_02, DOC_03, DOC_04 } from "./documents/batch1";
import { DOC_05, DOC_06, DOC_07, DOC_08, ARCH_08 } from "./documents/batch2";
import { DOC_09, DOC_10, DOC_11, DOC_12, ARCH_09 } from "./documents/batch3";
import { DOC_13, DOC_14, ARCH_10 } from "./documents/batch4";
import { DOC_15 } from "./documents/doc15";

export const documents: Record<DocId, Doc> = {
  "DOC-01": { id: "DOC-01", title: "GRU PROJECT I Authorization Brief (1957)", batch: 1, content: DOC_01 },
  "DOC-02": { id: "DOC-02", title: "Sorokin Lab Notes (Jan 9–11, 1961)", batch: 1, content: DOC_02 },
  "DOC-03": { id: "DOC-03", title: "Incineration Order (Jan 11, 1961)", batch: 1, content: DOC_03 },
  "DOC-04": { id: "DOC-04", title: "Voss Private Notes (Jan 12, 1961)", batch: 1, content: DOC_04 },

  "DOC-05": { id: "DOC-05", title: "Rohini FIR (March 2011)", batch: 2, content: DOC_05 },
  "DOC-06": { id: "DOC-06", title: "Medical Examination Report (March 2011)", batch: 2, content: DOC_06 },
  "DOC-07": { id: "DOC-07", title: "Mathur Cross-Reference Memo (Sept 2021)", batch: 2, content: DOC_07 },
  "DOC-08": { id: "DOC-08", title: "Stillwater Constituting Order (Jan 2022)", batch: 2, content: DOC_08 },

  "DOC-09": { id: "DOC-09", title: "Ferretti Witness Inconsistency Analysis", batch: 3, content: DOC_09 },
  "DOC-10": { id: "DOC-10", title: "Nair Neurochemical Consultation Report", batch: 3, content: DOC_10 },
  "DOC-11": { id: "DOC-11", title: "Tanaka Cross-Border Incident Registry", batch: 3, content: DOC_11 },
  "DOC-12": { id: "DOC-12", title: "Mathur Internal Note (Undated, Unsent)", batch: 3, content: DOC_12 },

  "DOC-13": { id: "DOC-13", title: "ARCH-07 — The Gennady Entry", batch: 4, content: DOC_13 },
  "DOC-14": { id: "DOC-14", title: "FIELD-19 — Personnel Status Update", batch: 4, content: DOC_14 },

  "DOC-15": { id: "DOC-15", title: "ONGOING.rec", batch: 99, content: DOC_15 },

  "ARCH-08": { id: "ARCH-08", title: "Unidentified Upload — Method", batch: 2, content: ARCH_08 },
  "ARCH-09": { id: "ARCH-09", title: "Unidentified Upload — Addendum on Consumption", batch: 3, content: ARCH_09 },
  "ARCH-10": { id: "ARCH-10", title: "Unidentified Upload — Final Note on the Archive", batch: 4, content: ARCH_10 },
};

export const batchTitles: Record<1 | 2 | 3 | 4, string> = {
  1: "BATCH 01 — SOVIET ORIGINS",
  2: "BATCH 02 — DELHI CASES",
  3: "BATCH 03 — INTERPOL AND RAW ANALYSIS",
  4: "BATCH 04 — THE UNRAVELLING",
};

export function docsForBatch(batch: 1 | 2 | 3 | 4): Doc[] {
  return Object.values(documents).filter((d) => d.batch === batch);
}
