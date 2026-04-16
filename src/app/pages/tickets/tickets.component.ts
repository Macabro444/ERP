import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { ApiService } from '../../services/api.service';

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
export class TicketsComponent implements OnInit {
  dialogCrear = false;
  dialogDetalle = false;
  ticketSeleccionado: Ticket | null = null;
  nuevoComentario = '';

  grupos: any[] = [];
  usuariosOpciones: any[] = [];

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

  estadosIds: Record<string, string> = {};
  prioridadesIds: Record<string, string> = {};

  nuevoTicket: any = {};

  constructor(
    public ticketsService: TicketsService,
    private msg: MessageService,
    private confirm: ConfirmationService,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {
    this.nuevoTicket = this.ticketVacio();
  }

  ngOnInit() {
    this.cargarGrupos();
    this.cargarUsuarios();
    this.cargarEstados();
    this.cargarPrioridades();
  }

  cargarGrupos() {
    this.api.getGrupos().subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          this.grupos = res.data.map((g: any) => ({
            label: g.nombre,
            value: g.id,
          }));
          this.cdr.markForCheck();
        }
      },
    });
  }

  cargarUsuarios() {
    this.api.getUsuarios().subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          this.usuariosOpciones = res.data.map((u: any) => ({
            label: u.username,
            value: u.id,
          }));
          this.cdr.markForCheck();
        }
      },
    });
  }

  cargarEstados() {
    this.api.getEstados().subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          res.data.forEach((e: any) => {
            this.estadosIds[e.nombre] = e.id;
          });
        }
      },
    });
  }

  cargarPrioridades() {
    this.api.getPrioridades().subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          res.data.forEach((p: any) => {
            this.prioridadesIds[p.nombre] = p.id;
          });
        }
      },
    });
  }

  get tickets() {
    return this.ticketsService.tickets();
  }

  get minFecha(): string {
    return new Date().toISOString().split('T')[0];
  }

  get usuarios() {
    return this.usuariosOpciones;
  }

  ticketVacio() {
    return {
      titulo: '',
      descripcion: '',
      estado: 'pendiente',
      prioridad: 'media',
      fechaLimite: '',
      grupoId: '',
      asignadoId: '',
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

    const user = JSON.parse(sessionStorage.getItem('erp_user') || '{}');

    const ticketData = {
      titulo: this.nuevoTicket.titulo,
      descripcion: this.nuevoTicket.descripcion,
      grupo_id: this.nuevoTicket.grupoId,
      estado_id: this.estadosIds[this.nuevoTicket.estado],
      prioridad_id: this.prioridadesIds[this.nuevoTicket.prioridad],
      autor_id: user.id,
      asignado_id: this.nuevoTicket.asignadoId || null,
      fecha_final: this.nuevoTicket.fechaLimite || null,
    };

    this.api.createTicket(ticketData).subscribe({
      next: () => {
        this.dialogCrear = false;
        this.ticketsService.cargarTickets();
        this.msg.add({
          severity: 'success',
          summary: 'Creado',
          detail: 'Ticket creado correctamente',
        });
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el ticket' });
      },
    });
  }

  verDetalle(ticket: Ticket) {
    this.ticketSeleccionado = { ...ticket };
    this.nuevoComentario = '';
    this.dialogDetalle = true;
  }

  agregarComentario() {
    if (!this.nuevoComentario.trim() || !this.ticketSeleccionado) return;
    this.ticketsService.agregarComentario(this.ticketSeleccionado.id, this.nuevoComentario);
    this.nuevoComentario = '';
    this.dialogDetalle = false;
    this.msg.add({ severity: 'success', summary: 'Comentario agregado', detail: '' });
    this.cdr.markForCheck();
  }

  eliminar(ticket: Ticket) {
    this.confirm.confirm({
      message: `¿Eliminar el ticket "${ticket.titulo}"?`,
      header: 'Confirmar',
      icon: 'pi pi-trash',
      accept: () => {
        this.ticketsService.eliminar(ticket.id);
        this.msg.add({ severity: 'warn', summary: 'Eliminado', detail: 'Ticket eliminado' });
        this.cdr.markForCheck();
      },
    });
  }
}
