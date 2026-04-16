import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { PermisosSyncService } from '../../services/permisos-sync.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private permisosSync = inject(PermisosSyncService);

  ngOnInit() {
    this.permisosSync.iniciar();
  }

  ngOnDestroy() {
    this.permisosSync.detener();
  }
}