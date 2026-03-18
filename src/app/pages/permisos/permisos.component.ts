import { Component, signal } from '@angular/core';
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

interface Usuario {
  id: number;
  nombre: string;
  usuario: string;
  email: string;
  tipo: 'admin' | 'cliente';
  avatar: string;
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
export class PermisosComponent {

  usuarioSeleccionado = signal<Usuario | null>(null);

  usuarios: Usuario[] = [
    {
      id: 1, nombre: 'Jorge Trejo', usuario: 'Macabro444',
      email: 'macabrosss444@gmail.com', tipo: 'admin', avatar: 'JE'
    },
    {
      id: 2, nombre: 'Emmanuel Martínez', usuario: 'EmmaM',
      email: 'emmamar@gmail.com', tipo: 'cliente', avatar: 'EM'
    }
  ];

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

  permisosEditables: Record<number, string[]> = {};

constructor(
  private permissionsService: PermissionsService,
  private msg: MessageService
) {
  this.permisosEditables = {
    1: [...this.permissionsService['permisosAdmin']],
    2: [...this.permissionsService['permisosCliente']]
  };
}

  seleccionar(usuario: Usuario) {
    this.usuarioSeleccionado.set(usuario);
  }

  tienePermiso(usuarioId: number, permiso: string): boolean {
    return this.permisosEditables[usuarioId]?.includes(permiso) ?? false;
  }

  togglePermiso(usuario: Usuario, permiso: string) {
  const lista = [...this.permisosEditables[usuario.id]];

  if (lista.includes(permiso)) {
    this.permisosEditables[usuario.id] = lista.filter(p => p !== permiso);
  } else {
    this.permisosEditables[usuario.id] = [...lista, permiso];
  }

  const key = usuario.tipo === 'admin' ? 'permisos_admin' : 'permisos_cliente';
  localStorage.setItem(key, JSON.stringify(this.permisosEditables[usuario.id]));

  const activo = sessionStorage.getItem('usuario_activo');
  if (activo === usuario.tipo) {
    this.permissionsService['userPermissions'].set(
      this.permisosEditables[usuario.id]
    );
  }

  this.msg.add({
    severity: lista.includes(permiso) ? 'warn' : 'success',
    summary: lista.includes(permiso) ? 'Permiso removido' : 'Permiso agregado',
    detail: `${permiso} — ${usuario.nombre}`
  });
}

  volver() {
    this.usuarioSeleccionado.set(null);
  }
}