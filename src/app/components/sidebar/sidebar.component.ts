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
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  constructor(
    private permissions: PermissionsService,
    private router: Router,
    private api: ApiService,
  ) {}

  cerrarSesion() {
    this.api.clearToken();
    this.permissions.clearPermissions();
    sessionStorage.removeItem('erp_user');
    sessionStorage.removeItem('erp_permisos');
    window.location.replace('/login');
  }
}
