import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GrupoStateService {
  grupoSeleccionado = signal<number | null>(null);
}
