import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { MessageService, ConfirmationService } from 'primeng/api';
import { GrupoStateService } from '../../services/grupo-state';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { TicketsService } from '../../services/tickets.service';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

interface Miembro {
  id: number;
  nombre: string;
  usuario: string;
  email: string;
}

interface Grupo {
  id: number;
  nombre: string;
  descripcion: string;
  nivel: string;
  miembros: Miembro[];
  tickets: number;
}

@Component({
  selector: 'app-grupos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    TagModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    AvatarModule,
    DividerModule,
    SelectModule,
    TextareaModule,
    HasPermissionDirective,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './grupos.component.html',
  styleUrl: './grupos.component.css',
})
export class GruposComponent implements OnInit {
  grupos: Grupo[] = [
    {
      id: 1,
      nombre: 'Departamento TI',
      descripcion: 'Tecnologías y Innovación',
      nivel: 'Avanzado',
      tickets: 2,
      miembros: [
        { id: 1, nombre: 'Jorge Trejo', usuario: 'macabro444', email: 'macabrosss444@gmail.com' },
        { id: 2, nombre: 'Moises Lozano', usuario: 'Moiloz', email: 'moiloz@gmail.com' },
      ],
    },
    {
      id: 2,
      nombre: 'Servicios Escolares',
      descripcion: 'Avisos',
      nivel: 'Básico',
      tickets: 1,
      miembros: [
        { id: 1, nombre: 'Valeria Gonzalez', usuario: 'GonzVal', email: 'Valegonzzz@gmail.com' },
      ],
    },
  ];

  usuariosDisponibles: Miembro[] = [
    { id: 3, nombre: 'Tito Billalobos', usuario: 'Tibb', email: 'titodoublep@gmail.com' },
    { id: 4, nombre: 'Emmanuel Martinez', usuario: 'EmmaM', email: 'emmamar@gmail.com' },
    { id: 5, nombre: 'Jose Delgadillo', usuario: 'ElDelga', email: 'delgaaa@gmail.com' },
  ];

  dialogGrupo = false;
  dialogMiembros = false;
  esEdicion = false;
  grupoActual: Grupo = this.grupoVacio();
  grupoDetalle: Grupo | null = null;
  busquedaMiembro = '';
  grupoFiltrado: number | null = null;

  dialogTicket = false;
  grupoTicket: Grupo | null = null;
  nuevoTicket = this.ticketVacio();

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

  usuariosOpciones = [
    { label: 'Macabro444', value: 'Jorge Trejo' },
    { label: 'MoiLoz', value: 'Moises Lozano' },
    { label: 'Sin asignar', value: '' },
  ];

  constructor(
    private msg: MessageService,
    private confirm: ConfirmationService,
    private grupoState: GrupoStateService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    public ticketsService: TicketsService,
  ) {}

  ngOnInit() {
    this.grupoFiltrado = this.grupoState.grupoSeleccionado();
    if (this.grupoFiltrado !== null) {
      const grupo = this.grupos.find((g) => g.id === this.grupoFiltrado);
      if (grupo) this.verMiembros(grupo);
      this.grupoState.grupoSeleccionado.set(null);
    }
  }

  grupoVacio(): Grupo {
    return { id: 0, nombre: '', descripcion: '', nivel: '', miembros: [], tickets: 0 };
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
      grupoId: 0,
    };
  }

  abrirNuevo() {
    this.grupoActual = this.grupoVacio();
    this.esEdicion = false;
    this.dialogGrupo = true;
  }

  editar(grupo: Grupo) {
    this.grupoActual = { ...grupo, miembros: [...grupo.miembros] };
    this.esEdicion = true;
    this.dialogGrupo = true;
  }

  guardar() {
    if (!this.grupoActual.nombre) {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'El nombre es obligatorio' });
      return;
    }
    if (this.esEdicion) {
      const i = this.grupos.findIndex((g) => g.id === this.grupoActual.id);
      this.grupos[i] = { ...this.grupoActual };
      this.msg.add({ severity: 'success', summary: 'Actualizado', detail: 'Grupo actualizado' });
    } else {
      this.grupoActual.id = this.grupos.length + 1;
      this.grupos = [...this.grupos, { ...this.grupoActual }];
      this.msg.add({ severity: 'success', summary: 'Creado', detail: 'Grupo creado' });
    }
    this.dialogGrupo = false;
  }

  eliminarGrupo(grupo: Grupo) {
    this.confirm.confirm({
      message: `¿Eliminar el grupo "${grupo.nombre}"?`,
      header: 'Confirmar',
      icon: 'pi pi-trash',
      accept: () => {
        this.zone.run(() => {
          this.grupos = [...this.grupos.filter((g) => g.id !== grupo.id)];
          this.msg.add({ severity: 'warn', summary: 'Eliminado', detail: 'Grupo eliminado' });
        });
      },
    });
  }

  verMiembros(grupo: Grupo) {
    this.grupoDetalle = grupo;
    this.busquedaMiembro = '';
    this.dialogMiembros = true;
  }

  get usuariosFiltrados(): Miembro[] {
    if (!this.busquedaMiembro) return this.usuariosDisponibles;
    const b = this.busquedaMiembro.toLowerCase();
    return this.usuariosDisponibles.filter(
      (u) =>
        u.nombre.toLowerCase().includes(b) ||
        u.usuario.toLowerCase().includes(b) ||
        u.email.toLowerCase().includes(b),
    );
  }

  esMiembro(usuario: Miembro): boolean {
    return this.grupoDetalle?.miembros.some((m) => m.id === usuario.id) ?? false;
  }

  agregarMiembro(usuario: Miembro) {
    if (!this.grupoDetalle) return;
    if (this.esMiembro(usuario)) return;
    this.grupoDetalle.miembros = [...this.grupoDetalle.miembros, usuario];
    this.msg.add({
      severity: 'success',
      summary: 'Agregado',
      detail: `${usuario.nombre} agregado al grupo`,
    });
  }

  eliminarMiembro(miembro: Miembro) {
    if (!this.grupoDetalle) return;
    this.confirm.confirm({
      message: `¿Eliminar a "${miembro.nombre}" del grupo?`,
      header: 'Confirmar',
      icon: 'pi pi-user-minus',
      accept: () => {
        this.grupoDetalle!.miembros = this.grupoDetalle!.miembros.filter(
          (m) => m.id !== miembro.id,
        );
        this.msg.add({
          severity: 'warn',
          summary: 'Eliminado',
          detail: `${miembro.nombre} eliminado del grupo`,
        });
      },
    });
  }

  abrirCrearTicket(grupo: Grupo) {
    this.grupoTicket = grupo;
    this.nuevoTicket = { ...this.ticketVacio(), grupoId: grupo.id };
    this.dialogTicket = true;
  }

  crearTicket() {
    if (!this.nuevoTicket.titulo) {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'El título es obligatorio' });
      return;
    }
    this.ticketsService.agregar(this.nuevoTicket);
    this.dialogTicket = false;
    this.msg.add({ severity: 'success', summary: 'Creado', detail: 'Ticket creado correctamente' });
  }
}
