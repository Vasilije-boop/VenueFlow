import type { KandidatPreviewDTO } from "./KandidatPreviewDTO.js";

export class ApplicationResponseDTO {
  ID: number;
  Opis: string;
  DatumKreiranja: Date;
  Korisnik: KandidatPreviewDTO;
}