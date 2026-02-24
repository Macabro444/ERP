import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ButtonModule, InputTextModule, FormsModule, MessageModule, CommonModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  errorMsg = '';

  private validEmail = 'macabrosss444@gmail.com';
  private validPassword = 'Maca@44444';

  constructor(private router: Router) {}

  login() {
    if (this.email === this.validEmail && this.password === this.validPassword) {
      this.errorMsg = '';
      alert('Bienvenido Macabro444');
      // this.router.navigate(['/dashboard']); // para después
    } else {
      this.errorMsg = 'Correo o contraseña incorrectos';
    }
  }
}