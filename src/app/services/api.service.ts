import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private gatewayUrl = 'http://localhost:4000';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  saveToken(token: string): void {
    document.cookie = `erp_token=${token}; path=/; max-age=3600; SameSite=Strict`;
  }

  getToken(): string | null {
    const match = document.cookie.match(/erp_token=([^;]+)/);
    return match ? match[1] : null;
  }

  clearToken(): void {
    document.cookie = 'erp_token=; path=/; max-age=0';
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/auth/register`, data);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/auth/login`, { email, password });
  }

  getGrupos(): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/grupos`, { headers: this.getHeaders() });
  }

  createGrupo(data: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/grupos`, data, { headers: this.getHeaders() });
  }

  updateGrupo(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.gatewayUrl}/grupos/${id}`, data, { headers: this.getHeaders() });
  }

  deleteGrupo(id: string): Observable<any> {
    return this.http.delete(`${this.gatewayUrl}/grupos/${id}`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.getToken()}`,
      }),
    });
  }

  addMiembro(grupoId: string, usuarioId: string): Observable<any> {
    return this.http.post(
      `${this.gatewayUrl}/grupos/${grupoId}/miembros`,
      { usuario_id: usuarioId },
      { headers: this.getHeaders() },
    );
  }

  getTickets(): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/tickets`, { headers: this.getHeaders() });
  }

  createTicket(data: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/tickets`, data, { headers: this.getHeaders() });
  }

  updateTicket(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.gatewayUrl}/tickets/${id}`, data, {
      headers: this.getHeaders(),
    });
  }

  deleteTicket(id: string): Observable<any> {
    return this.http.delete(`${this.gatewayUrl}/tickets/${id}`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.getToken()}`,
      }),
    });
  }

  addComentario(ticketId: string, data: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/tickets/${ticketId}/comentarios`, data, {
      headers: this.getHeaders(),
    });
  }

  getUsuarios(): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/usuarios`, { headers: this.getHeaders() });
  }

  getPermisos(): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/permisos`, { headers: this.getHeaders() });
  }

  updatePermisos(usuarioId: string, permisosIds: string[]): Observable<any> {
    return this.http.patch(
      `${this.gatewayUrl}/usuarios/${usuarioId}`,
      { permisos_globales: permisosIds },
      { headers: this.getHeaders() },
    );
  }

  removeMiembro(grupoId: string, usuarioId: string): Observable<any> {
    return this.http.delete(`${this.gatewayUrl}/grupos/${grupoId}/miembros/${usuarioId}`, {
      headers: this.getHeaders(),
    });
  }

  getEstados(): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/estados`, { headers: this.getHeaders() });
  }

  getPrioridades(): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/prioridades`, { headers: this.getHeaders() });
  }

  getPerfil(id: string): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/usuarios/me/${id}`, { headers: this.getHeaders() });
  }

  updatePerfil(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.gatewayUrl}/usuarios/${id}`, data, {
      headers: this.getHeaders(),
    });
  }
}
