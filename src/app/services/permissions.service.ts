import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PermissionsService {

  private userPermissions = signal<string[]>([
    'dashboard.view',
    'grupos.view',
    'grupos.editar',
    'grupos.eliminar',
    'usuario.view',
    'usuario.editar',
    // 'usuario.eliminar', //
    'tickets.view',
    'tickets.crear',
  ]);

  hasPermission(permiso: string): boolean {
    return this.userPermissions().includes(permiso);
  }

  hasAnyPermission(permisos: string[]): boolean {
    return permisos.some(p => this.hasPermission(p));
  }

  setPermissions(permisos: string[]) {
    this.userPermissions.set(permisos);
  }
}