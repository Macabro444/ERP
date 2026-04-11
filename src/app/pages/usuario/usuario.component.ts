import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { ApplicationRef } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Message } from 'primeng/message';
import { HasPermissionDirective } from '../../directives/has-permission.directive';
import { ApiService } from '../../services/api.service';
import { PermissionsService } from '../../services/permissions.service';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [
    CardModule, TagModule, DividerModule, AvatarModule,
    ButtonModule, DialogModule, InputTextModule, FormsModule,
    ToastModule, ConfirmDialogModule, CommonModule, Message,
    HasPermissionDirective,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css',
})
export class UsuarioComponent implements OnInit {
  private appRef = inject(ApplicationRef);

  dialogVisible = false;

  perfil = {
    id: '',
    nombre: '',
    usuario: '',
    email: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: '',
    rol: 'Usuario',
  };

  perfilEdicion = { ...this.perfil };

  constructor(
    private msg: MessageService,
    private confirm: ConfirmationService,
    private router: Router,
    private api: ApiService,
    private permissions: PermissionsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('erp_user') || '{}');
    if (user.id) {
      this.api.getPerfil(user.id).subscribe({
        next: (res: any) => {
          if (res.statusCode === 200) {
            const u = res.data;
            this.perfil = {
              id: u.id,
              nombre: u.nombre_completo ?? '',
              usuario: u.username ?? '',
              email: u.email ?? '',
              telefono: u.telefono ?? '',
              direccion: u.direccion ?? '',
              fechaNacimiento: u.fecha_nacimiento ?? '',
              rol: user.permisos?.includes('dashboard.view') ? 'Administrador' : 'Cliente'
            };
            this.cdr.markForCheck();
            this.appRef.tick();
          }
        },
        error: (err: any) => {
          console.log('Error getPerfil:', err);
        }
      });
    }
  }

  get edad(): number {
    if (!this.perfil.fechaNacimiento) return 0;
    const hoy = new Date();
    const nac = new Date(this.perfil.fechaNacimiento);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  }

  get maxFechaNacimiento(): string {
    const hoy = new Date();
    hoy.setFullYear(hoy.getFullYear() - 18);
    return hoy.toISOString().split('T')[0];
  }

  soloNumeros(event: KeyboardEvent) {
    if (!/[0-9]/.test(event.key)) event.preventDefault();
  }

  abrirEdicion() {
    this.perfilEdicion = { ...this.perfil };
    this.dialogVisible = true;
  }

  guardar() {
    if (!this.perfilEdicion.nombre || !this.perfilEdicion.email) {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'Nombre y email son obligatorios' });
      return;
    }
    if (!this.perfilEdicion.email.includes('@')) {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'El email debe contener @' });
      return;
    }
    if (this.perfilEdicion.telefono.length !== 10) {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'El teléfono debe tener exactamente 10 dígitos' });
      return;
    }

    this.api.updatePerfil(this.perfil.id, {
      nombre_completo: this.perfilEdicion.nombre,
      username: this.perfilEdicion.usuario,
      telefono: this.perfilEdicion.telefono,
      direccion: this.perfilEdicion.direccion,
      fecha_nacimiento: this.perfilEdicion.fechaNacimiento
    }).subscribe({
      next: () => {
        this.perfil = { ...this.perfilEdicion };
        this.dialogVisible = false;
        this.msg.add({ severity: 'success', summary: '¡Actualizado!', detail: 'Perfil actualizado correctamente' });
        this.appRef.tick();
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el perfil' });
      }
    });
  }

  eliminarCuenta() {
    this.confirm.confirm({
      message: '¿Estás seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.',
      header: 'Eliminar cuenta',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.clearToken();
        this.permissions.clearPermissions();
        localStorage.removeItem('erp_user');
        this.msg.add({ severity: 'warn', summary: 'Cuenta eliminada', detail: 'Redirigiendo...' });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      },
    });
  }
}