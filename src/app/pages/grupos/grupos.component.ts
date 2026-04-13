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
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { HasPermissionDirective } from '../../directives/has-permission.directive';
import { ApiService } from '../../services/api.service';

interface Miembro {
  id: string;
  nombre: string;
  usuario: string;
  email: string;
}

interface Grupo {
  id: string;
  nombre: string;
  descripcion: string;
  nivel: string;
  miembros: Miembro[];
  tickets: number;
  creador_id?: string;
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
  grupos: Grupo[] = [];
  usuariosDisponibles: Miembro[] = [];
  cargando = false;

  dialogGrupo = false;
  dialogMiembros = false;
  dialogTicket = false;
  esEdicion = false;
  grupoActual: Grupo = this.grupoVacio();
  grupoDetalle: Grupo | null = null;
  grupoTicket: Grupo | null = null;
  busquedaMiembro = '';
  nuevoTicket: any = {};

  nivelOpciones = [
    { label: 'Básico', value: 'Básico' },
    { label: 'Intermedio', value: 'Intermedio' },
    { label: 'Avanzado', value: 'Avanzado' },
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

  usuariosOpciones: any[] = [];

  constructor(
    private msg: MessageService,
    private confirm: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private api: ApiService,
  ) {
    this.nuevoTicket = this.ticketVacio();
  }

  ngOnInit() {
    this.cargarGrupos();
    this.cargarUsuarios();
  }

  get minFecha(): string {
    return new Date().toISOString().split('T')[0];
  }

  ticketVacio() {
    return {
      titulo: '',
      descripcion: '',
      estado: 'pendiente',
      asignadoA: '',
      prioridad: 'media',
      fechaLimite: '',
      grupoId: '',
    };
  }

  grupoVacio(): Grupo {
    return { id: '', nombre: '', descripcion: '', nivel: '', miembros: [], tickets: 0 };
  }

  cargarGrupos() {
    this.cargando = true;
    this.api.getGrupos().subscribe({
      next: (res: any) => {
        this.cargando = false;
        if (res.statusCode === 200) {
          this.api.getTickets().subscribe({
            next: (ticketsRes: any) => {
              const todosTickets = ticketsRes.data ?? [];
              this.grupos = res.data.map((g: any) => ({
                id: g.id,
                nombre: g.nombre,
                descripcion: g.descripcion ?? '',
                nivel: g.nivel ?? '',
                creador_id: g.creador_id,
                tickets: todosTickets.filter((t: any) => t.grupo_id === g.id).length,
                miembros:
                  g.miembros?.map((m: any) => ({
                    id: m.usuario?.id ?? m.usuario_id,
                    nombre: m.usuario?.nombre_completo ?? '',
                    usuario: m.usuario?.username ?? '',
                    email: m.usuario?.email ?? '',
                  })) ?? [],
              }));
              this.cdr.markForCheck();
            },
          });
        }
      },
      error: () => {
        this.cargando = false;
      },
    });
  }

  cargarUsuarios() {
    this.api.getUsuarios().subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          this.usuariosDisponibles = res.data.map((u: any) => ({
            id: u.id,
            nombre: u.nombre_completo,
            usuario: u.username,
            email: u.email,
          }));
          this.usuariosOpciones = res.data.map((u: any) => ({
            label: u.username,
            value: u.id,
          }));
          this.cdr.markForCheck();
        }
      },
    });
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
    const user = JSON.parse(localStorage.getItem('erp_user') || '{}');
    if (this.esEdicion) {
      this.api
        .updateGrupo(this.grupoActual.id, {
          nombre: this.grupoActual.nombre,
          descripcion: this.grupoActual.descripcion,
          nivel: this.grupoActual.nivel,
        })
        .subscribe({
          next: () => {
            this.msg.add({
              severity: 'success',
              summary: 'Actualizado',
              detail: 'Grupo actualizado',
            });
            this.dialogGrupo = false;
            this.cargarGrupos();
          },
          error: () => {
            this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' });
          },
        });
    } else {
      this.api
        .createGrupo({
          nombre: this.grupoActual.nombre,
          descripcion: this.grupoActual.descripcion,
          nivel: this.grupoActual.nivel,
          creador_id: user.id,
        })
        .subscribe({
          next: () => {
            this.msg.add({ severity: 'success', summary: 'Creado', detail: 'Grupo creado' });
            this.dialogGrupo = false;
            this.cargarGrupos();
          },
          error: () => {
            this.msg.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo crear el grupo',
            });
          },
        });
    }
  }

  eliminarGrupo(grupo: Grupo) {
    this.confirm.confirm({
      message: `¿Eliminar el grupo "${grupo.nombre}"?`,
      header: 'Confirmar',
      icon: 'pi pi-trash',
      accept: () => {
        this.api.deleteGrupo(grupo.id).subscribe({
          next: () => {
            this.msg.add({ severity: 'warn', summary: 'Eliminado', detail: 'Grupo eliminado' });
            this.cargarGrupos();
          },
          error: (err) => {
            console.log('Error eliminar:', err);
            this.msg.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el grupo',
            });
          },
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
    if (!this.grupoDetalle || this.esMiembro(usuario)) return;
    this.api.addMiembro(this.grupoDetalle.id, usuario.id).subscribe({
      next: () => {
        this.msg.add({
          severity: 'success',
          summary: 'Agregado',
          detail: `${usuario.nombre} agregado`,
        });
        this.cargarGrupos();
      },
      error: () => {
        this.msg.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo agregar el miembro',
        });
      },
    });
  }

  eliminarMiembro(miembro: Miembro) {
    if (!this.grupoDetalle) return;
    this.confirm.confirm({
      message: `¿Eliminar a "${miembro.nombre}" del grupo?`,
      header: 'Confirmar',
      icon: 'pi pi-user-minus',
      accept: () => {
        this.api.removeMiembro(this.grupoDetalle!.id, miembro.id).subscribe({
          next: () => {
            this.msg.add({
              severity: 'warn',
              summary: 'Eliminado',
              detail: `${miembro.nombre} eliminado`,
            });
            this.cargarGrupos();
          },
        });
      },
    });
  }

  abrirCrearTicket(grupo: Grupo) {
    this.grupoTicket = grupo;
    this.nuevoTicket = { ...this.ticketVacio(), grupoId: grupo.id };
    this.usuariosOpciones = grupo.miembros.map((m) => ({
      label: m.usuario,
      value: m.id,
    }));
    this.dialogTicket = true;
  }

  crearTicket() {
    if (!this.nuevoTicket.titulo) {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'El título es obligatorio' });
      return;
    }

    const user = JSON.parse(localStorage.getItem('erp_user') || '{}');

    const ticketData = {
      titulo: this.nuevoTicket.titulo,
      descripcion: this.nuevoTicket.descripcion,
      grupo_id: this.grupoTicket?.id,
      estado_id: '7f9b16bb-a276-4e31-9814-0be095d4ec56',
      prioridad_id: '6bb36b40-744f-4482-94d1-a2550680ae85',
      autor_id: user.id,
      asignado_id: this.nuevoTicket.asignadoA || null,
      fecha_final: this.nuevoTicket.fechaLimite || null,
    };

    this.api.createTicket(ticketData).subscribe({
      next: () => {
        this.dialogTicket = false;
        this.nuevoTicket = this.ticketVacio();
        this.msg.add({
          severity: 'success',
          summary: 'Creado',
          detail: 'Ticket creado correctamente',
        });
        this.cargarGrupos();
      },
      error: (err) => {
        console.log('Error:', err);
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el ticket' });
      },
    });
  }
}
