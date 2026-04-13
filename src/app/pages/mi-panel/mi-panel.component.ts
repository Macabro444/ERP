import { Component, OnInit, inject } from '@angular/core';
import { ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TicketsService, Ticket } from '../../services/tickets.service';
import { PermissionsService } from '../../services/permissions.service';
import { SelectModule } from 'primeng/select';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-mi-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TagModule,
    TableModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    DividerModule,
    AvatarModule,
    ToastModule,
    SelectModule,
  ],
  providers: [MessageService],
  templateUrl: './mi-panel.component.html',
  styleUrl: './mi-panel.component.css',
})
export class MiPanelComponent implements OnInit {
  private appRef = inject(ApplicationRef);

  cliente = {
    id: '',
    nombre: '',
    usuario: '',
    email: '',
    departamento: '',
  };

  dialogDetalle = false;
  dialogEditar = false;
  dialogEstado = false;
  ticketSeleccionado: Ticket | null = null;
  nuevaDescripcion = '';
  nuevoEstado = '';

  estadoOpciones = [
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'En Progreso', value: 'en-progreso' },
    { label: 'Revisión', value: 'revision' },
  ];

  constructor(
    public ticketsService: TicketsService,
    public permissions: PermissionsService,
    private msg: MessageService,
    private api: ApiService,
  ) {}

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('erp_user') || '{}');
    if (user.id) {
      this.cliente = {
        id: user.id,
        nombre: user.nombre_completo ?? '',
        usuario: user.username ?? '',
        email: user.email ?? '',
        departamento: '',
      };

      this.api.getPerfil(user.id).subscribe({
        next: (res: any) => {
          if (res.statusCode === 200) {
            const u = res.data;
            this.cliente = {
              id: u.id,
              nombre: u.nombre_completo ?? '',
              usuario: u.username ?? '',
              email: u.email ?? '',
              departamento: '',
            };
            setTimeout(() => this.appRef.tick(), 50);
          }
        },
      });
    }
  }

  get misTickets(): Ticket[] {
    return this.ticketsService.tickets().filter((t) => t.asignadoA === this.cliente.usuario);
  }

  get stats() {
    return {
      total: this.misTickets.length,
      pendiente: this.misTickets.filter((t) => t.estado === 'pendiente').length,
      enProgreso: this.misTickets.filter((t) => t.estado === 'en-progreso').length,
      finalizado: this.misTickets.filter((t) => t.estado === 'finalizado').length,
    };
  }

  verDetalle(ticket: Ticket) {
    this.ticketSeleccionado = { ...ticket };
    this.dialogDetalle = true;
  }

  abrirEditar(ticket: Ticket) {
    this.ticketSeleccionado = { ...ticket };
    this.nuevaDescripcion = ticket.descripcion;
    this.dialogEditar = true;
  }

  guardarDescripcion() {
    if (!this.nuevaDescripcion.trim()) {
      this.msg.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La descripción no puede estar vacía',
      });
      return;
    }
    const actualizado: Ticket = {
      ...this.ticketSeleccionado!,
      descripcion: this.nuevaDescripcion,
      historial: [],
    };
    this.ticketsService.actualizar(actualizado);
    this.dialogEditar = false;
    this.msg.add({
      severity: 'success',
      summary: '¡Actualizado!',
      detail: 'Descripción guardada correctamente',
    });
  }

  abrirCambiarEstado(ticket: Ticket) {
    this.ticketSeleccionado = { ...ticket };
    this.nuevoEstado = ticket.estado;
    this.dialogEstado = true;
  }

  guardarEstado() {
    const actualizado: Ticket = {
      ...this.ticketSeleccionado!,
      estado: this.nuevoEstado,
      historial: [],
    };
    this.ticketsService.actualizar(actualizado);
    this.dialogEstado = false;
    this.msg.add({
      severity: 'success',
      summary: 'Estado actualizado',
      detail: `Ticket movido a ${this.nuevoEstado}`,
    });
  }

  finalizarTicket(ticket: Ticket) {
    this.api.getEstados().subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          const estadoFinalizado = res.data.find((e: any) => e.nombre === 'finalizado');
          if (estadoFinalizado) {
            this.api
              .updateTicket(ticket.id, {
                estado_id: estadoFinalizado.id,
              })
              .subscribe({
                next: () => {
                  this.ticketsService.cargarTickets();
                  this.msg.add({
                    severity: 'success',
                    summary: '¡Finalizado!',
                    detail: 'Ticket marcado como finalizado',
                  });
                  setTimeout(() => this.appRef.tick(), 50);
                },
                error: (err) => {
                  console.log('Error finalizar:', err);
                  this.msg.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo finalizar el ticket',
                  });
                },
              });
          }
        }
      },
    });
  }

  severidadEstado(estado: string) {
    const map: any = {
      pendiente: 'warn',
      'en-progreso': 'info',
      revision: 'secondary',
      finalizado: 'success',
    };
    return map[estado] || 'info';
  }

  severidadPrioridad(prioridad: string) {
    const map: any = {
      baja: 'secondary',
      media: 'info',
      alta: 'warn',
      critica: 'danger',
    };
    return map[prioridad] || 'info';
  }
}
