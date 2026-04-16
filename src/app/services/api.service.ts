import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private gatewayUrl = 'http://localhost:4000';

  constructor(private http: HttpClient) {}

  saveToken(token: string): void {
    sessionStorage.setItem('erp_token', token);
  }

  getToken(): string | null {
    return sessionStorage.getItem('erp_token');
  }

  clearToken(): void {
    sessionStorage.removeItem('erp_token');
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/auth/register`, data);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/auth/login`, { email, password });
  }

  getGrupos(): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/grupos`);
  }

  getGrupoUsuario(userId: string): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/grupos/usuario/${userId}`);
  }

  createGrupo(data: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/grupos`, data);
  }

  updateGrupo(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.gatewayUrl}/grupos/${id}`, data);
  }

  deleteGrupo(id: string): Observable<any> {
    return this.http.delete(`${this.gatewayUrl}/grupos/${id}`);
  }

  addMiembro(grupoId: string, usuarioId: string): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/grupos/${grupoId}/miembros`, {
      usuario_id: usuarioId,
    });
  }

  removeMiembro(grupoId: string, usuarioId: string): Observable<any> {
    return this.http.delete(`${this.gatewayUrl}/grupos/${grupoId}/miembros/${usuarioId}`);
  }

  getTickets(): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/tickets`);
  }

  createTicket(data: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/tickets`, data);
  }

  updateTicket(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.gatewayUrl}/tickets/${id}`, data);
  }

  deleteTicket(id: string): Observable<any> {
    return this.http.delete(`${this.gatewayUrl}/tickets/${id}`);
  }

  addComentario(ticketId: string, data: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/tickets/${ticketId}/comentarios`, data);
  }

  getUsuarios(): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/usuarios`);
  }

  getPerfil(id: string): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/usuarios/me/${id}`);
  }

  updatePerfil(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.gatewayUrl}/usuarios/${id}`, data);
  }

  deleteUsuario(id: string): Observable<any> {
    return this.http.delete(`${this.gatewayUrl}/usuarios/${id}`);
  }

  getPermisos(): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/permisos`);
  }

  updatePermisos(usuarioId: string, permisosIds: string[]): Observable<any> {
    return this.http.patch(`${this.gatewayUrl}/usuarios/${usuarioId}`, {
      permisos_globales: permisosIds,
    });
  }

  getEstados(): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/estados`);
  }

  getPrioridades(): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/prioridades`);
  }
}
