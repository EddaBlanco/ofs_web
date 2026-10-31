import { HttpClient } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  HostListener,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

interface FotoGaleria {
  src: string;
  carpeta: string;
  carpetaId: string;
  titulo: string;
  descripcion: string;
  alt: string;
}

interface ManifestFotos {
  fotos?: FotoGaleria[];
}

const INTERVALO_MS = 5500;

@Component({
  selector: 'app-carrusel-fotos',
  imports: [],
  templateUrl: './carrusel-fotos.html',
  styleUrl: './carrusel-fotos.scss'
})
export class CarruselFotos {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly movimientoReducido =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  readonly fotos = signal<FotoGaleria[]>([]);
  readonly indice = signal(0);
  readonly reproduciendo = signal(true);
  readonly cargando = signal(true);
  readonly error = signal(false);

  private readonly ratonDentro = signal(false);
  private readonly forzarReproduccion = signal(false);
  private readonly paginaVisible = signal(
    typeof document === 'undefined' || !document.hidden
  );

  readonly total = computed(() => this.fotos().length);
  readonly numeroActual = computed(() => String(this.indice() + 1).padStart(2, '0'));
  readonly numeroTotal = computed(() => String(this.total()).padStart(2, '0'));
  readonly enMarcha = computed(
    () =>
      this.reproduciendo() &&
      (!this.ratonDentro() || this.forzarReproduccion()) &&
      this.paginaVisible() &&
      this.total() > 1 &&
      !this.movimientoReducido
  );

  private firma = '';
  private inicioSwipe: number | null = null;
  private ultimaCarga = 0;

  constructor() {
    // Programa el avance automático y lo reinicia al cambiar de diapositiva.
    effect((onCleanup) => {
      this.indice();
      if (!this.enMarcha()) return;

      const temporizador = setTimeout(() => this.siguiente(), INTERVALO_MS);
      onCleanup(() => clearTimeout(temporizador));
    });

    this.cargarManifest();
  }

  recargar(): void {
    this.error.set(false);
    this.cargarManifest();
  }

  siguiente(): void {
    if (this.total() === 0) return;
    this.indice.update((indice) => (indice + 1) % this.total());
  }

  anterior(): void {
    if (this.total() === 0) return;
    this.indice.update((indice) => (indice - 1 + this.total()) % this.total());
  }

  irA(indice: number): void {
    if (indice < 0 || indice >= this.total() || indice === this.indice()) return;
    this.indice.set(indice);
  }

  alternarReproduccion(): void {
    const nuevo = !this.reproduciendo();
    this.reproduciendo.set(nuevo);
    // Si se reanuda con el ratón encima, ignoramos la pausa por hover.
    this.forzarReproduccion.set(nuevo);
  }

  fondoFoto(foto: FotoGaleria): string {
    return `url("${foto.src}")`;
  }

  entrarRaton(): void {
    this.ratonDentro.set(true);
  }

  salirRaton(): void {
    this.ratonDentro.set(false);
    this.forzarReproduccion.set(false);
  }

  alPulsarTecla(evento: KeyboardEvent): void {
    if (evento.key === 'ArrowLeft') {
      evento.preventDefault();
      this.anterior();
    } else if (evento.key === 'ArrowRight') {
      evento.preventDefault();
      this.siguiente();
    } else if (evento.key === 'Home') {
      evento.preventDefault();
      this.irA(0);
    } else if (evento.key === 'End') {
      evento.preventDefault();
      this.irA(this.total() - 1);
    }
  }

  iniciarSwipe(evento: PointerEvent): void {
    if (evento.pointerType === 'mouse') return;
    this.inicioSwipe = evento.clientX;
  }

  terminarSwipe(evento: PointerEvent): void {
    if (this.inicioSwipe === null) return;

    const desplazamiento = evento.clientX - this.inicioSwipe;
    this.inicioSwipe = null;

    if (Math.abs(desplazamiento) < 40) return;
    if (desplazamiento < 0) {
      this.siguiente();
    } else {
      this.anterior();
    }
  }

  cancelarSwipe(): void {
    this.inicioSwipe = null;
  }

  @HostListener('document:visibilitychange')
  alCambiarVisibilidad(): void {
    this.paginaVisible.set(!document.hidden);
    if (!document.hidden) this.cargarManifest(false);
  }

  @HostListener('window:focus')
  alRecuperarFoco(): void {
    if (Date.now() - this.ultimaCarga > 5000) this.cargarManifest(false);
  }

  private cargarManifest(mostrarCargando = true): void {
    if (mostrarCargando) this.cargando.set(true);
    this.ultimaCarga = Date.now();

    const url = `${this.assetUrl('assets/img/fotos/fotos.json')}?v=${Date.now()}`;

    this.http
      .get<ManifestFotos>(url)
      .pipe(
        catchError(() => {
          if (this.total() === 0) this.error.set(true);
          this.cargando.set(false);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((datos) => {
        if (!datos) return;

        this.aplicarFotos(datos.fotos ?? []);
        this.error.set(false);
        this.cargando.set(false);
      });
  }

  private aplicarFotos(nuevas: FotoGaleria[]): void {
    const fotos = nuevas
      .filter((foto) => Boolean(foto?.src))
      .map((foto) => ({
        ...foto,
        src: this.assetUrl(foto.src),
        alt: foto.alt || `${foto.titulo} — ${foto.carpeta}`
      }));

    const firma = fotos
      .map((foto) => `${foto.src}|${foto.titulo}|${foto.descripcion}|${foto.carpeta}`)
      .sort()
      .join('|');

    // Si el manifiesto no ha cambiado, no reiniciamos el carrusel.
    if (firma === this.firma) return;

    this.firma = firma;
    this.fotos.set(this.mezclar(fotos));
    this.indice.set(0);
  }

  /** Mezcla las fotos para que no aparezcan agrupadas por carpeta. */
  private mezclar(fotos: FotoGaleria[]): FotoGaleria[] {
    const copia = [...fotos];
    for (let i = copia.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  private assetUrl(ruta: string): string {
    const base =
      typeof document !== 'undefined'
        ? document.querySelector('base')?.getAttribute('href') || '/'
        : '/';
    const baseNormalizada = base.endsWith('/') ? base : `${base}/`;

    return `${baseNormalizada}${ruta.replace(/^\/+/, '')}`;
  }
}
