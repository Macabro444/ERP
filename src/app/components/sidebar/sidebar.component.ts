import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { HasPermissionDirective } from '../../directives/has-permission.directive';
import { PermissionsService } from '../../services/permissions.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, HasPermissionDirective],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  constructor(
    private permissions: PermissionsService,
    private router: Router,
    private api: ApiService
  ) {}

  cerrarSesion() {
    // Limpiar todo
    this.api.clearToken();
    this.permissions.clearPermissions();
    localStorage.removeItem('erp_user');
    localStorage.removeItem('erp_permisos');
    sessionStorage.clear();

    // Redirigir y reemplazar historial para que no pueda regresar
    window.location.replace('/login');
  }
}