import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ButtonModule, InputTextModule, FormsModule, ReactiveFormsModule, MessageModule, CommonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  showPassword = false;
  showConfirm = false;
  loading = false;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private msg: MessageService,
    private api: ApiService,
    private router: Router
  ) {
    this.form = this.fb.group({
      usuario: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      fechaNacimiento: ['', [Validators.required, this.mayorDeEdad]],
      password: ['', [Validators.required, Validators.minLength(10), Validators.pattern(/^(?=.*[!@#$%^&*])/)]],
      confirmar: ['', Validators.required],
    }, { validators: this.passwordsIguales });
  }

  mayorDeEdad(control: AbstractControl): ValidationErrors | null {
    const fecha = new Date(control.value);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fecha.getFullYear();
    const cumplió = hoy >= new Date(fecha.setFullYear(fecha.getFullYear() + edad));
    return (cumplió ? edad : edad - 1) >= 18 ? null : { menorDeEdad: true };
  }

  passwordsIguales(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmar')?.value;
    return pass === confirm ? null : { noCoinciden: true };
  }

  get f() { return this.form.controls; }

  registrar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'Revisa los campos del formulario' });
      return;
    }

    this.loading = true;
    const { usuario, email, nombre, direccion, telefono, fechaNacimiento, password } = this.form.value;

    this.api.register({
      email,
      password,
      nombre,
      usuario,
      telefono,
      direccion,
      fechaNacimiento
    }).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.statusCode === 201) {
          this.msg.add({
            severity: 'success',
            summary: '¡Registro exitoso!',
            detail: 'Tu cuenta fue creada correctamente'
          });
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      },
      error: (err: any) => {
        this.loading = false;
        const mensaje = err.error?.data?.message ?? 'Error al registrar usuario';
        this.msg.add({ severity: 'error', summary: 'Error', detail: mensaje });
      }
    });
  }
}