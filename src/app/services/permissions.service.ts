import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private userPermissions = signal<string[]>(this.cargarPermisos());

  private cargarPermisos(): string[] {
    try {
      const guardados = localStorage.getItem('erp_permisos');
      if (guardados) return JSON.parse(guardados);
      return [];
    } catch {
      return [];
    }
  }

  setPermissionsFromArray(permisos: string[]): void {
    this.userPermissions.set(permisos);
    localStorage.setItem('erp_permisos', JSON.stringify(permisos));
  }

  setPermissions(tipo: 'admin' | 'cliente') {
    const permisosAdmin = [
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
      'permisos.view',
    ];
    const permisosCliente = [
      'mipanel.view',
      'ticket.ver-asignados',
      'ticket.editar-descripcion',
      'ticket.finalizar',
      'ticket.editar-estado',
    ];
    const permisos = tipo === 'admin' ? permisosAdmin : permisosCliente;
    this.setPermissionsFromArray(permisos);
  }

  hasPermission(permiso: string): boolean {
    return this.userPermissions().includes(permiso);
  }

  hasAnyPermission(permisos: string[]): boolean {
    return permisos.some((p) => this.hasPermission(p));
  }

  clearPermissions(): void {
    this.userPermissions.set([]);
    localStorage.removeItem('erp_permisos');
    localStorage.removeItem('erp_user');
  }

  removePermission(permiso: string) {
    this.userPermissions.update((permisos) => permisos.filter((p) => p !== permiso));
  }

  getUserInfo(): any {
    try {
      const user = localStorage.getItem('erp_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }
}
