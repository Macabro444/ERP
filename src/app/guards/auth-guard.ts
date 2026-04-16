import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '../services/api.service';

export const authGuard: CanActivateFn = () => {
  const api = inject(ApiService);
  const router = inject(Router);

  const token = api.getToken();
  const user = sessionStorage.getItem('erp_user');

  if (!token || !user) {
    sessionStorage.removeItem('erp_user');
    sessionStorage.removeItem('erp_permisos');
    router.navigate(['/login']);
    return false;
  }

  return true;
};
