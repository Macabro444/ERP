import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private permisosAdmin = [
    'dashboard.view',
    'grupos.view',
    'grupos.crear',
    'grupos.editar',
    'grupos.eliminar',
    'usuario.view',
    'usuario.eliminar',
    'usuario.editar',
    'tickets.view',
    'tickets.crear',
    'ticket.editar',
    'ticket.eliminar',
  ];

  private permisosCliente = [
    'mipanel.view',
    'ticket.ver-asignados',
    'ticket.editar-descripcion',
    'ticket.finalizar',
    //'ticket.editar-estado'//
  ];

  private userPermissions = signal<string[]>(this.cargarPermisos());

  private cargarPermisos(): string[] {
    try {
      const usuario = sessionStorage.getItem('usuario_activo');
      if (!usuario || (usuario !== 'admin' && usuario !== 'cliente')) {
        sessionStorage.clear();
        return [];
      }
      if (usuario === 'admin') return this.permisosAdmin;
      if (usuario === 'cliente') return this.permisosCliente;
      return [];
    } catch {
      sessionStorage.clear();
      return [];
    }
  }

  hasPermission(permiso: string): boolean {
    return this.userPermissions().includes(permiso);
  }

  hasAnyPermission(permisos: string[]): boolean {
    return permisos.some((p) => this.hasPermission(p));
  }

  setPermissions(tipo: 'admin' | 'cliente') {
    sessionStorage.setItem('usuario_activo', tipo);
    const permisos = tipo === 'admin' ? this.permisosAdmin : this.permisosCliente;
    this.userPermissions.set(permisos);
  }

  clearPermissions() {
    this.userPermissions.set([]);
    sessionStorage.removeItem('usuario_activo');
  }

  removePermission(permiso: string) {
    this.userPermissions.update((permisos) => permisos.filter((p) => p !== permiso));
  }
}
