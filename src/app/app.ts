import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 
import { SidebarComponent } from './shared/sidebar/sidebar';
import { TopbarComponent } from './shared/topbar/topbar';

// 1. IMPORTAMOS EL COMPONENTE HOME
import { HomeComponent } from './pages/home/home'; 

@Component({
  selector: 'app-root',
  standalone: true,
  // 2. AGREGAMOS 'HomeComponent' A ESTA LISTA DE IMPORTS
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, CommonModule, HomeComponent], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'kim-studio-admin';

  constructor(public router: Router) {} 
}