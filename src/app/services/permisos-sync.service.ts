import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { PermissionsService } from './permissions.service';

@Injectable({ providedIn: 'root' })
export class PermisosSyncService {
  private interval: any;
  private api = inject(ApiService);
  private permissions = inject(PermissionsService);
  private router = inject(Router);

  iniciar() {
    this.interval = setInterval(() => {
      this.verificarPermisos();
    }, 10000);
  }

  detener() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private verificarPermisos() {
    const user = JSON.parse(sessionStorage.getItem('erp_user') || '{}');
    if (!user.id) return;

    this.api.getPerfil(user.id).subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          
          this.api.getPermisos().subscribe({
            next: (permisosRes: any) => {
              if (permisosRes.statusCode === 200) {
                const permisosIds = res.data.permisos_globales ?? [];
                const todosPermisos = permisosRes.data;
                
              
                const nombresPermisos = todosPermisos
                  .filter((p: any) => permisosIds.includes(p.id))
                  .map((p: any) => p.nombre);

                const permisosActuales = this.permissions.getPermissions();
                
                const cambio = JSON.stringify(nombresPermisos.sort()) !== 
                               JSON.stringify(permisosActuales.sort());

                if (cambio) {
                
                  this.permissions.setPermissionsFromArray(nombresPermisos);

                  
                  if (nombresPermisos.includes('dashboard.view')) {
                    this.router.navigate(['/app/dashboard']);
                  } else if (nombresPermisos.includes('mipanel.view')) {
                    this.router.navigate(['/app/mi-panel']);
                  } else {
                    
                    this.api.clearToken();
                    this.permissions.clearPermissions();
                    sessionStorage.clear();
                    window.location.replace('/login');
                  }
                }
              }
            }
          });
        }
      }
    });
  }
}