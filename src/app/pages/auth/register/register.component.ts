import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ButtonModule, InputTextModule, FormsModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  nombre = '';
  email = '';
  password = '';
}