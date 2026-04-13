import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '../services/api.service';

export const authGuard: CanActivateFn = () => {
  const api = inject(ApiService);
  const router = inject(Router);

  const token = api.getToken();
  const user = localStorage.getItem('erp_user');

  if (!token || !user) {
  
    localStorage.removeItem('erp_user');
    localStorage.removeItem('erp_permisos');
    router.navigate(['/login']);
    return false;
  }

  return true;
};