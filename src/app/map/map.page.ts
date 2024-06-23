import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, IonSpinner } from '@ionic/angular/standalone';
import * as L from 'leaflet'; //npm i --save-dev @types/leaflet
import { Capacitor } from '@capacitor/core';
import { Platform } from '../platform';
import { from } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';

//https://edmirjano.medium.com/using-leaflet-js-openstreetmap-with-ionic-5-5d0110d042fc
//https://leafletjs.com/examples/layers-control/
//https://leafletjs.com/examples/quick-start/
//https://leafletjs.com/examples/wms/wms.html

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MapPage implements OnInit {

  constructor() { }

  platform: Platform;
  native: boolean = false;
  positioncoords: string = '';

  ngOnInit() {
    if (Capacitor.isNativePlatform()) {
      this.native = true;
    }
    this.position();
  }

  leafletMap: any;

  lat: number = -34.5997;

  lng: number = -58.3819;

  zoom: number = 16;

  spin: boolean = true;

  loadLeafletMap() {

    this.spin = true;

    this.leafletMap = new L.Map('leafletMap');

    const self = this;

    this.leafletMap.on('load', function () {

      setTimeout(() => {

        self.leafletMap.invalidateSize();
        self.spin = false;

      }, 100);

    });


    this.leafletMap.setView([this.lat, this.lng], this.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {

      attribution: '&copy;<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

    }).addTo(this.leafletMap);

    let icon = L.icon({

      iconUrl: 'marker-icon.png',

      iconSize: [30, 40]

    });

    let marker = L.marker([this.lat, this.lng], { icon: icon }).addTo(this.leafletMap)

    let popup = L.popup()

      .setContent('<h1>Click me</h1>');

    marker.bindPopup(popup);


    L.circle([this.lat, this.lng], {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: 500
    }).addTo(this.leafletMap);

    L.polygon([
      [this.lat - 0.002, this.lng - 0.002],
      [this.lat - 0.004, this.lng - 0.007],
      [this.lat - 0.008, this.lng - 0.012],
    ]).addTo(this.leafletMap);

    function onMapClick(e) {
      alert("You clicked the map at " + e.latlng);
    }

    this.leafletMap.on('click', onMapClick);

    let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    });

    let osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
    });

    let baseMaps = {
      'OpenStreetMap': osm,
      'OpenStreetMap.HOT': osmHOT,
      Topography: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
        layers: 'TOPO-WMS'
      }),

      Places: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
        layers: 'OSM-Overlay-WMS'
      }),

      'Topography, then places': L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
        layers: 'TOPO-WMS,OSM-Overlay-WMS'
      }),

      'Places, then topography': L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
        layers: 'OSM-Overlay-WMS,TOPO-WMS'
      })
    };

    let layerControl = L.control.layers(baseMaps).addTo(this.leafletMap);

    //baseMaps.Topography.addTo(this.leafletMap);


  }

  private position() {

    if (!this.native) {
      navigator.geolocation.getCurrentPosition(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.loadLeafletMap();
      }, e => {
        console.log(e);
      });
    } else {
      from(this.currentPositionNative()).subscribe(pos => {
        this.lat = pos.coords.latitude;
        this.lng = pos.coords.longitude;
        this.loadLeafletMap();
      })
    }
  }

  private currentPositionNative = async () => {
    return await Geolocation.getCurrentPosition();
  };

}
