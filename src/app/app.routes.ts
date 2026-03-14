import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { GruposComponent } from './pages/grupos/grupos.component';
import { UsuarioComponent } from './pages/usuario/usuario.component';
import { MiPanelComponent } from './pages/mi-panel/mi-panel.component';
import { authGuard } from './guards/auth-guard';
import { permissionGuard } from './guards/permission.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'grupos',
        component: GruposComponent,
        canActivate: [permissionGuard('grupos.view')],
      },
      {
        path: 'usuario',
        component: UsuarioComponent,
        canActivate: [permissionGuard('usuario.view')],
      },
      {
        path: 'mi-panel',
        component: MiPanelComponent,
        canActivate: [permissionGuard('mipanel.view')],
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
