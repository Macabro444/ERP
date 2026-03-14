import { Component } from '@angular/core';
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
export class MiPanelComponent {
  cliente = {
    nombre: 'Emmanuel Martínez',
    usuario: 'EmmaM',
    email: 'emmamar@gmail.com',
    departamento: 'Departamento TI'
  };

  dialogDetalle = false;
  dialogEditar = false;
  ticketSeleccionado: Ticket | null = null;
  nuevaDescripcion = '';

  constructor(
    public ticketsService: TicketsService,
    public permissions: PermissionsService,
    private msg: MessageService,
  ) {}

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
      historial: [
        ...this.ticketSeleccionado!.historial,
        {
          id: this.ticketSeleccionado!.historial.length + 1,
          campo: 'descripcion',
          valorAnterior: this.ticketSeleccionado!.descripcion,
          valorNuevo: this.nuevaDescripcion,
          fecha: new Date().toISOString().split('T')[0],
          usuario: this.cliente.usuario,
        },
      ],
    };
    this.ticketsService.actualizar(actualizado);
    this.dialogEditar = false;
    this.msg.add({
      severity: 'success',
      summary: '¡Actualizado!',
      detail: 'Descripción guardada correctamente',
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

  estadoOpciones = [
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'En Progreso', value: 'en-progreso' },
    { label: 'Revisión', value: 'revision' },
  ];

  dialogEstado = false;
  nuevoEstado = '';

  abrirCambiarEstado(ticket: Ticket) {
    this.ticketSeleccionado = { ...ticket };
    this.nuevoEstado = ticket.estado;
    this.dialogEstado = true;
  }

  guardarEstado() {
    const actualizado: Ticket = {
      ...this.ticketSeleccionado!,
      estado: this.nuevoEstado as any,
      historial: [
        ...this.ticketSeleccionado!.historial,
        {
          id: this.ticketSeleccionado!.historial.length + 1,
          campo: 'estado',
          valorAnterior: this.ticketSeleccionado!.estado,
          valorNuevo: this.nuevoEstado,
          fecha: new Date().toISOString().split('T')[0],
          usuario: this.cliente.usuario,
        },
      ],
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
    const actualizado: Ticket = {
      ...ticket,
      estado: 'finalizado',
      historial: [
        ...ticket.historial,
        {
          id: ticket.historial.length + 1,
          campo: 'estado',
          valorAnterior: ticket.estado,
          valorNuevo: 'finalizado',
          fecha: new Date().toISOString().split('T')[0],
          usuario: this.cliente.usuario,
        },
      ],
    };
    this.ticketsService.actualizar(actualizado);
    this.msg.add({
      severity: 'success',
      summary: '¡Finalizado!',
      detail: 'Ticket marcado como finalizado',
    });
  }
}
