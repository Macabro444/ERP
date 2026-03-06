import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TicketsService, Ticket } from '../../services/tickets.service';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    TagModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    DividerModule,
    TooltipModule,
    AvatarModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.css',
})
export class TicketsComponent {
  dialogCrear = false;
  dialogDetalle = false;
  ticketSeleccionado: Ticket | null = null;
  nuevoComentario = '';

  usuarios = [
    { label: 'Macabro444', value: 'Jorge Trejo' },
    { label: 'MoiLoz', value: 'Moises Lozano' },
    { label: 'Sin asignar', value: '' },
  ];

  estadoOpciones = [
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'En Progreso', value: 'en-progreso' },
    { label: 'Revisión', value: 'revision' },
    { label: 'Finalizado', value: 'finalizado' },
  ];

  prioridadOpciones = [
    { label: 'Baja', value: 'baja' },
    { label: 'Media', value: 'media' },
    { label: 'Alta', value: 'alta' },
    { label: 'Crítica', value: 'critica' },
  ];

  nuevoTicket = this.ticketVacio();

  constructor(
    public ticketsService: TicketsService,
    private msg: MessageService,
    private confirm: ConfirmationService,
  ) {}

  get tickets() {
    return this.ticketsService.tickets();
  }

  get minFecha(): string {
    return new Date().toISOString().split('T')[0];
  }

  ticketVacio() {
    return {
      titulo: '',
      descripcion: '',
      estado: 'pendiente' as const,
      asignadoA: '',
      prioridad: 'media' as const,
      fechaLimite: '',
      grupoId: 1,
    };
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

  abrirCrear() {
    this.nuevoTicket = this.ticketVacio();
    this.dialogCrear = true;
  }

  crearTicket() {
    if (!this.nuevoTicket.titulo) {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'El título es obligatorio' });
      return;
    }
    this.ticketsService.agregar(this.nuevoTicket);
    this.dialogCrear = false;
    this.msg.add({ severity: 'success', summary: 'Creado', detail: 'Ticket creado correctamente' });
  }

  verDetalle(ticket: Ticket) {
    this.ticketSeleccionado = { ...ticket };
    this.nuevoComentario = '';
    this.dialogDetalle = true;
  }

  agregarComentario() {
    if (!this.nuevoComentario.trim()) return;
    this.ticketsService.agregarComentario(this.ticketSeleccionado!.id, this.nuevoComentario);
    this.ticketSeleccionado = this.ticketsService
      .tickets()
      .find((t) => t.id === this.ticketSeleccionado!.id)!;
    this.nuevoComentario = '';
    this.msg.add({ severity: 'success', summary: 'Comentario agregado', detail: '' });
  }

  eliminar(ticket: Ticket) {
    this.confirm.confirm({
      message: `¿Eliminar el ticket "${ticket.titulo}"?`,
      header: 'Confirmar',
      icon: 'pi pi-trash',
      accept: () => {
        this.ticketsService.eliminar(ticket.id);
        this.msg.add({ severity: 'warn', summary: 'Eliminado', detail: 'Ticket eliminado' });
      },
    });
  }
}
