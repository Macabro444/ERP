import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy,
  Injector,
  effect,
  runInInjectionContext,
} from '@angular/core';
import { Router } from '@angular/router';
import { PermissionsService } from '../services/permissions.service';

const PERMISO_RUTA: Record<string, string> = {
  'grupos.view': '/app/grupos',
  'tickets.view': '/app/tickets',
  'usuario.view': '/app/usuario',
  'mipanel.view': '/app/mi-panel',
};

@Directive({
  selector: '[ifHasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  @Input() ifHasPermission: string | string[] = [];

  constructor(
    private template: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissions: PermissionsService,
    private injector: Injector,
    private router: Router,
  ) {}

  ngOnInit() {
    runInInjectionContext(this.injector, () => {
      effect(() => {
        const permisos = Array.isArray(this.ifHasPermission)
          ? this.ifHasPermission
          : [this.ifHasPermission];

        const tiene = this.permissions.hasAnyPermission(permisos);

        this.viewContainer.clear();
        if (tiene) {
          this.viewContainer.createEmbeddedView(this.template);
        } else {
          const rutaActual = this.router.url;
          const debeRedirigir = permisos.some(
            (p) => PERMISO_RUTA[p] && rutaActual.startsWith(PERMISO_RUTA[p]),
          );
          if (debeRedirigir) {
            this.router.navigate(['/app/dashboard']);
          }
        }
      });
    });
  }

  ngOnDestroy() {}
}
