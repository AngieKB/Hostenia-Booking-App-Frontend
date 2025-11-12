import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import mapboxgl, { LngLatLike, Map, Marker, MapMouseEvent } from 'mapbox-gl';
import { MarkerDTO } from '../models/marker-dto';

@Injectable({
  providedIn: 'root',
})
export class MapService implements OnDestroy {

  private map?: Map;
  private markers: Marker[] = [];  // Almacenar marcadores para limpiarlos
  private currentLocation: LngLatLike = [-75.6727, 4.53252];
  private readonly MAPBOX_TOKEN = 'pk.eyJ1IjoibWF5YXh4eSIsImEiOiJjbWhzZnlmNHMxaXZvMmpxMTJibHU1Y3FhIn0.RkPQt5Q2wdvDQ4b6QG5Swg';
  private destroy$ = new Subject<void>();

  constructor() {
    mapboxgl.accessToken = this.MAPBOX_TOKEN;
  }

  public create(containerId: string = 'map'): void {
    if (this.map) {
      this.map.remove();
    }

    this.map = new mapboxgl.Map({
      container: containerId,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.currentLocation,
      zoom: 17,
      pitch: 0,
      bearing: 0
    });

    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      })
    );

    // Esperar a que el mapa esté cargado
    this.map.on('load', () => {
      console.log('Mapa cargado');
      // Listener para forzar actualización de marcadores en zoom/pan (parche si Mapbox falla)
      this.map!.on('zoom', () => this.updateMarkers());
      this.map!.on('move', () => this.updateMarkers());
    });
  }

  public drawMarkers(places: MarkerDTO[]): void {
    if (!this.map) return;

    // Limpiar marcadores anteriores
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    // Esperar a que el mapa esté cargado
    if (this.map.isStyleLoaded()) {
      this.addMarkers(places);
    } else {
      this.map.on('load', () => this.addMarkers(places));
    }
  }

  private addMarkers(places: MarkerDTO[]): void {
    places.forEach(({ id, title, photoUrl, location }) => {
      const popupHtml = `
        <strong>${title}</strong>
        <div>
          <img src="${photoUrl}" alt="Imagen" style="width: 100px; height: 100px;">
        </div>
        <a href="/place/${id}">Ver más</a>
      `;

      // Crear marcador con anclaje explícito y offset cero para fijarlo
      const marker = new mapboxgl.Marker({
        color: 'red',
        anchor: 'center',  // Anclar al centro del punto geográfico
        offset: [0, 0]     // Sin offset para evitar desplazamientos
      })
        .setLngLat([location.longitud, location.latitud])
        .setPopup(new mapboxgl.Popup().setHTML(popupHtml))
        .addTo(this.map!);

      // Almacenar para limpieza
      this.markers.push(marker);
    });
  }

  // Método para forzar actualización de posiciones (si Mapbox no lo hace automáticamente)
  private updateMarkers(): void {
    this.markers.forEach(marker => {
      // Forzar recalculo de posición (Mapbox debería hacerlo, pero como parche)
      const lngLat = marker.getLngLat();
      marker.setLngLat(lngLat);  // Esto debería refrescar la posición
    });
  }

  /** Devuelve el mapa actual (si existe) */
  public get mapInstance(): Map | undefined {
    return this.map;
  }

  /** Limpieza al destruir el servicio */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Limpiar marcadores
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }
  public addMarker(): Observable<mapboxgl.LngLat> {
  return new Observable((observer) => {
    if (!this.map) {
      observer.error('Mapa no inicializado');
      return;
    }

    // Limpia los marcadores existentes y agrega uno nuevo en la posición del click
    const onClick = (e: MapMouseEvent) => {
      this.clearMarkers();
      const marker = new mapboxgl.Marker({ color: 'red' })
        .setLngLat(e.lngLat)
        .addTo(this.map!);

      this.markers.push(marker);
      // Emite las coordenadas del marcador al observador
      observer.next(marker.getLngLat());
    };

    this.map.on('click', onClick);

    // Limpieza al desuscribirse
    return () => {
      this.map?.off('click', onClick);
    };
  });
}
// Limpia todos los marcadores existentes del mapa
private clearMarkers(): void {
  this.markers.forEach(marker => marker.remove());
  this.markers = [];
}

// Actualiza el marcador a una nueva posición
public updateMarker(lat: number, lng: number): void {
  if (!this.map) return;
  
  this.clearMarkers();
  const marker = new mapboxgl.Marker({ color: 'red' })
    .setLngLat([lng, lat])
    .addTo(this.map);
  
  this.markers.push(marker);
  this.map.flyTo({ center: [lng, lat], zoom: 15 });
}

resize() {
  if (this.map) {
    this.map.resize();
  }
}


}