import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Message } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { PermissionsService } from '../../../services/permissions.service';
import { ApiService } from '../../../services/api.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ButtonModule,
    InputTextModule,
    FormsModule,
    Message,
    CommonModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  errorMsg = '';
  loading = false;

  private clickCount = 0;

  constructor(
    private router: Router,
    private permissions: PermissionsService,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private msg: MessageService,
  ) {}

  onLogoClick() {
    this.clickCount++;
    if (this.clickCount >= 5) {
      this.msg.add({
        severity: 'warn',
        summary: '¡Logro Desbloqueado!',
        detail: '"Perro Chismoso" — Encontraste el easter egg secreto',
        life: 5000,
      });
      this.clickCount = 0;
    }
  }

  login() {
    if (!this.email || !this.password) {
      this.errorMsg = 'Email y contraseña son obligatorios';
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.cdr.markForCheck();

    this.api.login(this.email, this.password).subscribe({
      next: (res: any) => {
        console.log('Respuesta del gateway:', res);
        this.loading = false;
        if (res.statusCode === 200) {
          this.api.saveToken(res.data.token);
          sessionStorage.setItem('erp_user', JSON.stringify(res.data.user)); 
          const permisos = res.data.user.permisos ?? [];
          this.permissions.setPermissionsFromArray(permisos);

          if (permisos.includes('dashboard.view')) {
            window.location.href = '/app/dashboard';
          } else {
            window.location.href = '/app/mi-panel';
          }
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = 'Correo o contraseña incorrectos';
        this.cdr.markForCheck();
      },
    });
  }
}
