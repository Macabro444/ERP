import { Component, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TicketsService, Ticket } from '../../services/tickets.service';
import { Router } from '@angular/router';
import { HasPermissionDirective } from '../../directives/has-permission.directive';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TagModule,
    SelectModule,
    ToggleSwitchModule,
    TableModule,
    TooltipModule,
    AvatarModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    DividerModule,
    TextareaModule,
    InputTextModule,
    HasPermissionDirective,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  vistaKanban = signal(false);
  grupoSeleccionado = signal<string | null>(null);

  filtroEstado = '';
  filtroPrioridad = '';
  filtroOrden = '';

  dialogDetalle = false;
  dialogEditar = false;
  ticketSeleccionado: Ticket | null = null;
  nuevoComentario = '';
  ticketEditar: any = null;

  grupos: any[] = [{ label: 'Departamentos', value: null }];
  usuariosOpciones: any[] = [];
  usuariosTicketEditar: any[] = [];

  estadoOpciones = [
    { label: 'Estado', value: '' },
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'En Progreso', value: 'en-progreso' },
    { label: 'Revisión', value: 'revision' },
    { label: 'Finalizado', value: 'finalizado' },
  ];

  prioridadOpciones = [
    { label: 'Dificultad', value: '' },
    { label: 'Baja', value: 'baja' },
    { label: 'Media', value: 'media' },
    { label: 'Alta', value: 'alta' },
    { label: 'Crítica', value: 'critica' },
  ];

  ordenOpciones = [
    { label: 'Tipo de orden', value: '' },
    { label: 'Fecha creación', value: 'fc' },
    { label: 'Fecha límite', value: 'fl' },
    { label: 'Prioridad', value: 'prioridad' },
    { label: 'Estado', value: 'estado' },
  ];

  columnas = [
    { estado: 'pendiente', label: 'Pendiente', color: '#f5900b' },
    { estado: 'en-progreso', label: 'En Progreso', color: '#3b82f6' },
    { estado: 'revision', label: 'Revisión', color: '#8b5cf6' },
    { estado: 'finalizado', label: 'Finalizado', color: '#10b981' },
  ];

  constructor(
    public ticketsService: TicketsService,
    private router: Router,
    private msg: MessageService,
    private confirm: ConfirmationService,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.api.getGrupos().subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          const opciones = res.data.map((g: any) => ({
            label: g.nombre,
            value: g.id,
          }));
          this.grupos = [{ label: 'Departamentos', value: null }, ...opciones];
          this.cdr.markForCheck();
        }
      },
    });

    this.api.getUsuarios().subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          this.usuariosOpciones = res.data.map((u: any) => ({
            label: u.username,
            value: u.id,
          }));
        }
      },
    });
  }

  get ticketsFiltrados(): Ticket[] {
    let lista = this.ticketsService.tickets();
    if (this.grupoSeleccionado() !== null) {
      lista = lista.filter((t) => t.grupoId === this.grupoSeleccionado());
    }
    if (this.filtroEstado) {
      lista = lista.filter((t) => t.estado === this.filtroEstado);
    }
    if (this.filtroPrioridad) {
      lista = lista.filter((t) => t.prioridad === this.filtroPrioridad);
    }
    if (this.filtroOrden === 'fc') {
      lista = [...lista].sort((a, b) => a.fechaCreacion.localeCompare(b.fechaCreacion));
    } else if (this.filtroOrden === 'fl') {
      lista = [...lista].sort((a, b) => a.fechaLimite.localeCompare(b.fechaLimite));
    } else if (this.filtroOrden === 'prioridad') {
      const orden: any = { critica: 0, alta: 1, media: 2, baja: 3 };
      lista = [...lista].sort((a, b) => orden[a.prioridad] - orden[b.prioridad]);
    } else if (this.filtroOrden === 'estado') {
      lista = [...lista].sort((a, b) => a.estado.localeCompare(b.estado));
    }
    return lista;
  }

  ticketsPorEstado(estado: string): Ticket[] {
    return this.ticketsFiltrados.filter((t) => t.estado === estado);
  }

  get stats() {
    const todos = this.ticketsService.tickets();
    return {
      total: todos.length,
      pendiente: todos.filter((t) => t.estado === 'pendiente').length,
      enProgreso: todos.filter((t) => t.estado === 'en-progreso').length,
      revision: todos.filter((t) => t.estado === 'revision').length,
      finalizado: todos.filter((t) => t.estado === 'finalizado').length,
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

  seleccionarGrupo(valor: string | null) {
    this.grupoSeleccionado.set(valor);
    if (valor !== null) {
      this.router.navigate(['/app/grupos']);
    }
  }

  verDetalle(ticket: Ticket) {
    this.ticketSeleccionado = { ...ticket };
    this.nuevoComentario = '';
    this.dialogDetalle = true;
  }

  abrirEditar(ticket: Ticket) {
    this.ticketEditar = { ...ticket, asignadoA: null };
    this.usuariosTicketEditar = [];
    this.dialogEditar = true;

    this.api.getGrupos().subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          const grupo = res.data.find((g: any) => g.id === ticket.grupoId);
          if (grupo) {
            this.usuariosTicketEditar =
              grupo.miembros?.map((m: any) => ({
                label: m.usuario?.username ?? m.username,
                value: m.usuario?.id ?? m.id,
              })) ?? [];

            const asignado = this.usuariosTicketEditar.find((u) => u.label === ticket.asignadoA);
            this.ticketEditar.asignadoA = asignado?.value ?? null;
            this.cdr.markForCheck();
          }
        }
      },
    });
  }

  guardarEdicion() {
    if (!this.ticketEditar.titulo) return;

    console.log('asignadoA:', this.ticketEditar.asignadoA);

    this.api
      .updateTicket(this.ticketEditar.id, {
        titulo: this.ticketEditar.titulo,
        descripcion: this.ticketEditar.descripcion,
        fecha_final: this.ticketEditar.fechaLimite,
        asignado_id: this.ticketEditar.asignadoA || null,
      })
      .subscribe({
        next: () => {
          this.dialogEditar = false;
          this.ticketsService.cargarTickets();
          this.msg.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: 'Ticket actualizado',
          });
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.log('Error:', err);
          this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' });
        },
      });
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

  agregarComentario() {
    if (!this.nuevoComentario.trim() || !this.ticketSeleccionado) return;
    this.ticketsService.agregarComentario(this.ticketSeleccionado.id, this.nuevoComentario);
    this.ticketSeleccionado = this.ticketsService
      .tickets()
      .find((t) => t.id === this.ticketSeleccionado!.id)!;
    this.nuevoComentario = '';
  }
}
