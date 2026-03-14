import { Component } from '@angular/core';
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

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [
    CardModule,
    TagModule,
    DividerModule,
    AvatarModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    Message,
    HasPermissionDirective,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css',
})
export class UsuarioComponent {
  dialogVisible = false;

  perfil = {
    nombre: 'Jorge Angel Trejo Cuevas',
    usuario: 'Macabro444',
    email: 'macabrosss444@gmail.com',
    telefono: '4421234567',
    direccion: 'Querétaro, México',
    fechaNacimiento: '2000-05-15',
    rol: 'Administrador',
  };

  perfilEdicion = { ...this.perfil };

  constructor(
    private msg: MessageService,
    private confirm: ConfirmationService,
    private router: Router,
  ) {}

  get edad(): number {
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
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  abrirEdicion() {
    this.perfilEdicion = { ...this.perfil };
    this.dialogVisible = true;
  }

  guardar() {
    if (!this.perfilEdicion.nombre || !this.perfilEdicion.email) {
      this.msg.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Nombre y email son obligatorios',
      });
      return;
    }
    if (!this.perfilEdicion.email.includes('@')) {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'El email debe contener @' });
      return;
    }
    if (this.perfilEdicion.telefono.length !== 10) {
      this.msg.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El teléfono debe tener exactamente 10 dígitos',
      });
      return;
    }
    const nac = new Date(this.perfilEdicion.fechaNacimiento);
    const hoy = new Date();
    let edadCalc = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edadCalc--;
    if (edadCalc < 18) {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'Debes ser mayor de 18 años' });
      return;
    }
    this.perfil = { ...this.perfilEdicion };
    this.dialogVisible = false;
    this.msg.add({
      severity: 'success',
      summary: '¡Actualizado!',
      detail: 'Perfil actualizado correctamente',
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
        this.msg.add({ severity: 'warn', summary: 'Cuenta eliminada', detail: 'Redirigiendo...' });
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      },
    });
  }
}
