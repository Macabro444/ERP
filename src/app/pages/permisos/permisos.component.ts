import { Component, signal, OnInit, inject } from '@angular/core';
import { ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PermissionsService } from '../../services/permissions.service';
import { ApiService } from '../../services/api.service';

interface Usuario {
  id: string;
  nombre: string;
  usuario: string;
  email: string;
  avatar: string;
  tipo?: string;
  permisos_globales: string[];
}

interface GrupoPermiso {
  modulo: string;
  icono: string;
  color: string;
  permisos: string[];
}

@Component({
  selector: 'app-permisos',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, CardModule,
    TagModule, DividerModule, ToastModule, TooltipModule,
    ToggleSwitchModule
  ],
  providers: [MessageService],
  templateUrl: './permisos.component.html',
  styleUrl: './permisos.component.css'
})
export class PermisosComponent implements OnInit {

  private appRef = inject(ApplicationRef);

  usuarioSeleccionado = signal<Usuario | null>(null);
  usuarios: Usuario[] = [];
  cargando = true;
  permisosEditables: Record<string, string[]> = {};
  permisosMap: Record<string, string> = {};

  gruposPermisos: GrupoPermiso[] = [
    {
      modulo: 'Dashboard',
      icono: 'pi-chart-bar',
      color: '#3b82f6',
      permisos: ['dashboard.view']
    },
    {
      modulo: 'Grupos',
      icono: 'pi-users',
      color: '#8b5cf6',
      permisos: ['grupos.view', 'grupos.crear', 'grupos.editar', 'grupos.eliminar']
    },
    {
      modulo: 'Tickets',
      icono: 'pi-ticket',
      color: '#f59e0b',
      permisos: ['tickets.view', 'tickets.crear', 'ticket.editar', 'ticket.eliminar']
    },
    {
      modulo: 'Usuario',
      icono: 'pi-id-card',
      color: '#10b981',
      permisos: ['usuario.view', 'usuario.editar', 'usuario.eliminar']
    },
    {
      modulo: 'Mi Panel',
      icono: 'pi-home',
      color: '#ef4444',
      permisos: [
        'mipanel.view', 'ticket.ver-asignados',
        'ticket.editar-descripcion', 'ticket.finalizar', 'ticket.editar-estado'
      ]
    },
    {
      modulo: 'Permisos',
      icono: 'pi-shield',
      color: '#64748b',
      permisos: ['permisos.view']
    }
  ];

  constructor(
    private permissionsService: PermissionsService,
    private api: ApiService,
    private msg: MessageService
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarMapaPermisos();
  }

  cargarMapaPermisos() {
    this.api.getPermisos().subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          res.data.forEach((p: any) => {
            this.permisosMap[p.nombre] = p.id;
          });
        }
      }
    });
  }

  cargarUsuarios() {
    this.api.getUsuarios().subscribe({
      next: (res: any) => {
        this.cargando = false;
        if (res.statusCode === 200) {
          this.usuarios = res.data.map((u: any) => ({
            id: u.id,
            nombre: u.nombre_completo,
            usuario: u.username,
            email: u.email,
            avatar: u.nombre_completo?.substring(0, 2).toUpperCase(),
            tipo: u.permisos_globales?.length > 5 ? 'admin' : 'cliente',
            permisos_globales: u.permisos_globales ?? []
          }));

          this.usuarios.forEach(u => {
            this.permisosEditables[u.id] = [...u.permisos_globales];
          });

          this.appRef.tick();
        }
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  seleccionar(usuario: Usuario) {
    this.usuarioSeleccionado.set(usuario);
    this.appRef.tick();
  }

  tienePermiso(usuarioId: string, permisoNombre: string): boolean {
    const permisoId = this.permisosMap[permisoNombre];
    return this.permisosEditables[usuarioId]?.includes(permisoId) ?? false;
  }

  togglePermiso(usuario: Usuario, permisoNombre: string) {
    const permisoId = this.permisosMap[permisoNombre];
    if (!permisoId) return;

    const lista = [...this.permisosEditables[usuario.id]];
    const tienePermiso = lista.includes(permisoId);

    if (tienePermiso) {
      this.permisosEditables[usuario.id] = lista.filter(p => p !== permisoId);
    } else {
      this.permisosEditables[usuario.id] = [...lista, permisoId];
    }

    this.api.updatePermisos(usuario.id, this.permisosEditables[usuario.id]).subscribe({
      next: () => {
        this.msg.add({
          severity: tienePermiso ? 'warn' : 'success',
          summary: tienePermiso ? 'Permiso removido' : 'Permiso agregado',
          detail: `${permisoNombre} — ${usuario.nombre}`
        });
        this.appRef.tick();
      },
      error: () => {
        this.msg.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el permiso'
        });
      }
    });
  }

  volver() {
    this.usuarioSeleccionado.set(null);
    this.appRef.tick();
  }

  getPermisosActivos(usuarioId: string): number {
    return this.permisosEditables[usuarioId]?.length ?? 0;
  }
}