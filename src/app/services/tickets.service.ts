import { Injectable, signal } from '@angular/core';

export interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  estado: 'pendiente' | 'en-progreso' | 'revision' | 'finalizado';
  asignadoA: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  fechaCreacion: string;
  fechaLimite: string;
  comentarios: Comentario[];
  historial: Historial[];
  grupoId: number;
}

export interface Comentario {
  id: number;
  autor: string;
  texto: string;
  fecha: string;
}

export interface Historial {
  id: number;
  campo: string;
  valorAnterior: string;
  valorNuevo: string;
  fecha: string;
  usuario: string;
}

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private _tickets = signal<Ticket[]>([
    {
      id: 1,
      titulo: 'Configurar nuevo equipo en Edificio I Division DTAI',
      descripcion: 'Configurar laptop para el Mtro.Emmanual Garcia',
      estado: 'en-progreso',
      asignadoA: 'Macabro444',
      prioridad: 'alta',
      fechaCreacion: '2026-03-06',
      fechaLimite: '2026-03-10',
      comentarios: [
        {
          id: 1,
          autor: 'Macabro444',
          texto: 'Va, En un momento paso a recogerla',
          fecha: '2026-03-07',
        },
      ],
      historial: [
        {
          id: 1,
          campo: 'estado',
          valorAnterior: 'pendiente',
          valorNuevo: 'en-progreso',
          fecha: '2026-03-07',
          usuario: 'Macabro444',
        },
      ],
      grupoId: 1,
    },
    {
      id: 2,
      titulo: 'Configurar Cañon para proyectar en Edificio K Division DTAI',
      descripcion: 'Favor de ayudarme a configurar el proyector, ya que el HDMI no esta agarrando',
      estado: 'finalizado',
      asignadoA: 'MoiLoz',
      prioridad: 'media',
      fechaCreacion: '2026-03-01',
      fechaLimite: '2026-03-03',
      comentarios: [],
      historial: [],
      grupoId: 1,
    },
    {
      id: 3,
      titulo: 'Pasar a recoger los Boletos para la rifa',
      descripcion: 'Favor de pasar por su bonche de boletos para venderlos',
      estado: 'pendiente',
      asignadoA: 'EmmaM',
      prioridad: 'baja',
      fechaCreacion: '2026-03-01',
      fechaLimite: '2026-03-10',
      comentarios: [],
      historial: [],
      grupoId: 2,
    },
  ]);

  get tickets() {
    return this._tickets;
  }

  agregar(ticket: Omit<Ticket, 'id' | 'fechaCreacion' | 'comentarios' | 'historial'>) {
    const nuevo: Ticket = {
      ...ticket,
      id: this._tickets().length + 1,
      fechaCreacion: new Date().toISOString().split('T')[0],
      comentarios: [],
      historial: [
        {
          id: 1,
          campo: 'estado',
          valorAnterior: '',
          valorNuevo: ticket.estado,
          fecha: new Date().toISOString().split('T')[0],
          usuario: 'Macabro444',
        },
      ],
    };
    this._tickets.update((t) => [...t, nuevo]);
  }

  actualizar(ticket: Ticket) {
    this.tickets.update((lista) => lista.map((t) => (t.id === ticket.id ? { ...ticket } : t)));
  }

  eliminar(id: number) {
    this._tickets.update((ts) => ts.filter((t) => t.id !== id));
  }

  agregarComentario(ticketId: number, texto: string) {
    this._tickets.update((ts) =>
      ts.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            comentarios: [
              ...t.comentarios,
              {
                id: t.comentarios.length + 1,
                autor: 'Macabro444',
                texto,
                fecha: new Date().toISOString().split('T')[0],
              },
            ],
          };
        }
        return t;
      }),
    );
  }

  porGrupo(grupoId: number) {
    return this._tickets().filter((t) => t.grupoId === grupoId);
  }
}
