
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Trabajo {
  id_imagen: number;
  titulo: string;
  categoria: string;
  url_imagen: string;
  url_imagen_despues?: string;
  fecha_subida?: string;
}

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './galeria.html',
  styleUrl: './galeria.css'
})
export class GaleriaComponent implements OnInit {

  isModalOpen = false;
  cargando = false;
  guardando = false;

  filtroActual = 'todos';
  mensajeError = '';

  trabajos: Trabajo[] = [];

  nuevoTrabajo = {
    titulo: '',
    categoriaId: 'cabello',
    imgAntes: '',
    imgDespues: ''
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerTrabajos();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  // CORREGIR RUTAS DE LAS IMÁGENES
  

resolverImagen(ruta: string | null | undefined): string {
  if (!ruta || !ruta.trim()) {
    return '';
  }

  let valor = ruta.trim();

  // Extraer la dirección de un enlace Markdown: [texto](URL)
  const enlace = valor.match(
    /^\[[^\]]*\]\((https?:\/\/[^)]+)\)$/i
  );

  if (enlace) {
    valor = enlace[1];
  }

  // Eliminar caracteres de escape que pudieran haberse guardado.
  valor = valor
    .replace(/\\&/g, '&')
    .replace(/\\/g, '/');

  // Conservar URL externas.
  if (/^https?:\/\//i.test(valor)) {
    return valor;
  }

  // Convertir rutas locales a las que sirve Angular.
  valor = valor
    .replace(/^\/?public\/img\//i, '/img/')
    .replace(/^\/?assets\/img\//i, '/img/')
    .replace(/^\/?img\//i, '/img/');

  return valor.startsWith('/') ? valor : '/' + valor;
}



  // IMAGEN ALTERNATIVA CUANDO FALLA LA ORIGINAL
 

imagenConError(event: Event): void {
  const imagen = event.target as HTMLImageElement;

  console.error('Falló la imagen:', {
    src: imagen.getAttribute('src'),
    urlSolicitada: imagen.currentSrc
  });

  // No reemplazarla por la imagen de public.
  imagen.classList.add('imagen-error');
}



  // OBTENER TRABAJOS DESDE SPRING BOOT
  obtenerTrabajos(): void {
  this.cargando = true;
  this.mensajeError = '';

  this.http.get<Trabajo[]>(
    `${environment.apiUrl}/galeria`,
    { headers: this.getHeaders() }
  ).subscribe({
    next: (data) => {
  console.log('RESPUESTA COMPLETA DEL BACKEND:', data);
  console.log('TRABAJO RECIBIDO:', JSON.stringify(data, null, 2));

  this.trabajos = data.map((item: any) => ({
    ...item,
    url_imagen: item.url_imagen,
    url_imagen_despues: item.url_imagen_despues
  }));

  console.log('URL ANTES:', this.trabajos.map(t => t.url_imagen));
  console.log(
    'URL DESPUÉS:',
    this.trabajos.map(t => t.url_imagen_despues)
  );

  this.cargando = false;
  this.cdr.detectChanges();
},

    error: (err) => {
      console.error('Error al cargar la galería:', err);

      this.mensajeError =
        'No se pudo cargar la galería. Verifica la conexión con el servidor.';

      this.cargando = false;
      this.cdr.detectChanges();
    }
  });
}

  // FILTRAR TRABAJOS
  get galeriaFiltrada(): Trabajo[] {

    if (this.filtroActual === 'todos') {
      return this.trabajos;
    }

    return this.trabajos.filter(
      trabajo =>
        trabajo.categoria?.toLowerCase() ===
        this.filtroActual.toLowerCase()
    );
  }

  // MOSTRAR NOMBRE DE CATEGORÍA
  categoriaTexto(categoria: string): string {

    switch (categoria?.toLowerCase()) {

      case 'cabello':
        return 'Cabello y tintes';

      case 'uñas':
        return 'Manicura y uñas';

      case 'cejas':
        return 'Mirada y cejas';

      default:
        return categoria || 'General';
    }
  }

  // ABRIR MODAL
  abrirModal(): void {

    this.nuevoTrabajo = {
      titulo: '',
      categoriaId: 'cabello',
      imgAntes: '',
      imgDespues: ''
    };

    this.mensajeError = '';
    this.isModalOpen = true;
  }

  // CERRAR MODAL
  cerrarModal(): void {

    if (this.guardando) {
      return;
    }

    this.isModalOpen = false;
    this.mensajeError = '';
  }

  // PUBLICAR TRABAJO
  
guardarTrabajo(event: Event): void {

  event.preventDefault();

  if (this.guardando) return;

  const titulo = this.nuevoTrabajo.titulo.trim();
  const imagenAntes = this.nuevoTrabajo.imgAntes.trim();
  const imagenDespues = this.nuevoTrabajo.imgDespues.trim();

  if (!titulo || !imagenAntes || !imagenDespues) {
    this.mensajeError =
      'Completa el título y las fotografías del antes y después.';
    return;
  }

  const payload = {
    titulo,
    categoria: this.nuevoTrabajo.categoriaId,
    url_imagen: this.resolverImagen(imagenAntes),
    url_imagen_despues: this.resolverImagen(imagenDespues)
  };

  this.guardando = true;
  this.mensajeError = '';

  this.http.post(
    `${environment.apiUrl}/galeria`,
    payload,
    { headers: this.getHeaders() }
  ).subscribe({

    next: () => {
      this.guardando = false;
      this.isModalOpen = false;

      this.obtenerTrabajos();

      alert('¡Trabajo publicado con sus dos fotografías!');
    },

    error: (err) => {
      console.error('Error al publicar:', err);

      this.guardando = false;
      this.mensajeError = 'No se pudo publicar el trabajo.';
      this.cdr.detectChanges();
    }
  });
}


  // ELIMINAR TRABAJO
  eliminarTrabajo(id: number, titulo: string): void {

    const confirmar = confirm(
      `¿Estás seguro de eliminar "${titulo}" de la galería?`
    );

    if (!confirmar) {
      return;
    }

    this.http.delete(
      `${environment.apiUrl}/galeria/${id}`,
      { headers: this.getHeaders() }
    ).subscribe({

      next: () => {

        this.trabajos = this.trabajos.filter(
          trabajo => trabajo.id_imagen !== id
        );

        this.cdr.detectChanges();

        alert('Trabajo eliminado correctamente.');
      },

      error: (err) => {

        console.error('Error al eliminar trabajo:', err);

        alert('No se pudo eliminar el trabajo.');
      }

    });
  }

}
