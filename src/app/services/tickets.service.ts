import { Injectable, signal, inject } from '@angular/core';
import { ApplicationRef } from '@angular/core';
import { ApiService } from './api.service';

export interface Ticket {
  id: string;
  titulo: string;
  descripcion: string;
  estado: string;
  asignadoA: string;
  prioridad: string;
  fechaCreacion: string;
  fechaLimite: string;
  comentarios: Comentario[];
  historial: any[];
  grupoId: string;
  grupos?: any;
  estados?: any;
  prioridades?: any;
  asignado?: any;
}

export interface Comentario {
  id: string;
  autor: string;
  texto: string;
  fecha: string;
}

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private _tickets = signal<Ticket[]>([]);
  cargando = signal(false);
  private appRef = inject(ApplicationRef);

  constructor(private api: ApiService) {
    this.cargarTickets();
  }

  cargarTickets() {
    this.cargando.set(true);
    this.api.getTickets().subscribe({
      next: (res: any) => {
        this.cargando.set(false);
        if (res.statusCode === 200) {
          const tickets = res.data.map((t: any) => ({
            id: t.id,
            titulo: t.titulo,
            descripcion: t.descripcion,
            estado: t.estados?.nombre ?? t.estado_id,
            asignadoA: t.asignado?.username ?? 'Sin asignar',
            prioridad: t.prioridades?.nombre ?? t.prioridad_id,
            fechaCreacion: t.creado_en?.split('T')[0] ?? '',
            fechaLimite: t.fecha_final ?? '',
            comentarios: t.comentarios?.map((c: any) => ({
              id: c.id,
              autor: c.autor?.username ?? 'Usuario',
              texto: c.contenido,
              fecha: c.creado_en?.split('T')[0] ?? ''
            })) ?? [],
            historial: [],
            grupoId: t.grupo_id,
            grupos: t.grupos,
            estados: t.estados,
            prioridades: t.prioridades,
            asignado: t.asignado
          }));
          this._tickets.set(tickets);
          this.appRef.tick();
        }
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }


  get tickets() {
    return this._tickets;
  }

  agregar(ticket: any) {
    this.api.createTicket(ticket).subscribe({
      next: () => this.cargarTickets()
    });
  }

  actualizar(ticket: Ticket) {
    this.api.updateTicket(ticket.id, {
      titulo: ticket.titulo,
      descripcion: ticket.descripcion,
      fecha_final: ticket.fechaLimite
    }).subscribe({
      next: () => this.cargarTickets()
    });
  }

  eliminar(id: string) {
    this.api.deleteTicket(id).subscribe({
      next: () => this.cargarTickets()
    });
  }

  agregarComentario(ticketId: string, texto: string) {
    const user = JSON.parse(localStorage.getItem('erp_user') || '{}');
    this.api.addComentario(ticketId, {
      contenido: texto,
      autor_id: user.id
    }).subscribe({
      next: () => this.cargarTickets()
    });
  }

  porGrupo(grupoId: string) {
    return this._tickets().filter((t) => t.grupoId === grupoId);
  }
}