import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, IonButton, IonList, IonItem, IonSpinner } from '@ionic/angular/standalone';
import { Geolocation } from '@capacitor/geolocation';
import { from, bindCallback } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { Platform } from '../platform';


@Component({
  selector: 'app-gps',
  templateUrl: './gps.page.html',
  styleUrls: ['./gps.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonItem, IonList, IonButton, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class GpsPage implements OnInit {

  constructor() { }

  platform: Platform;
  native: boolean = false;
  idWatch: any;
  positioncoords: string = '';
  positioncoordsroaming: string = '';
  track: number = 0;
  spinner: boolean = false;
  isRoaming = false;

  ngOnInit() {

    //this.getCurrentPosition();

    if (Capacitor.getPlatform() === 'ios') {
      this.platform = Platform.IOS;
    } else if (Capacitor.getPlatform() === 'web') {
      this.platform = Platform.WEB;
    } else {
      this.platform = Platform.ANDROID;
    }

    if (Capacitor.isNativePlatform()) {
      this.native = true;
    }
  }

  position() {

    this.spinner = true;

    if (!this.native) {
      navigator.geolocation.getCurrentPosition(position => {
        this.positioncoords = 'Latitude: ' + position.coords.latitude +
          ' Longitude: ' + position.coords.longitude + ' Accuracy: ' +
          position.coords.accuracy;
        this.spinner = false;
      }, e => {
        console.log(e);
      });
    } else {
      from(this.currentPositionNative()).subscribe(pos => {
        this.positioncoords = 'Latitude: ' + pos.coords.latitude +
          ' Longitude: ' + pos.coords.longitude + ' Accuracy: ' +
          pos.coords.accuracy;
        this.spinner = false;
      })
    }
  }


  positionRoam() {
    if (!this.native) {
      this.idWatch = navigator.geolocation.watchPosition(position => {
        this.positioncoordsroaming = 'Track ' + this.track + ' Latitude: ' + position.coords.latitude +
          ' Longitude: ' + position.coords.longitude + ' Accuracy: ' +
          position.coords.accuracy;
        this.track++;
        this.isRoaming = true;
      });
    } else {
      from(this.positionRoamingNative()).subscribe(pos => console.log('roaming native'));
    }
  }

  positionRoamClear() {
    if (!this.native) {
      navigator.geolocation.clearWatch(this.idWatch);
    } else {
      Geolocation.clearWatch(this.idWatch);
    }
    this.isRoaming = false;
    this.positioncoordsroaming = '';
    this.track=0;
  }

  private currentPositionNative = async () => {
    return await Geolocation.getCurrentPosition();
  };

  private positionRoamingNative = async () => {
    this.idWatch = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        maximumAge: 0
      },
      (position) => {
        try {
          this.positioncoordsroaming = 'Track ' + this.track + ' Latitude: ' + position.coords.latitude +
            ' Longitude: ' + position.coords.longitude + ' Accuracy: ' +
            position.coords.accuracy;
          this.track++;
          this.isRoaming = true;

        } catch (e) {
          console.log(e);
        }
      }
    );
  };

  private async getCurrentPosition() {
    const checkedPerms = await Geolocation.checkPermissions();
    console.log('Geolocation.checkPermissions()', checkedPerms);
    const perms = await Geolocation.requestPermissions();
    console.log('Geolocation.requestPermissions()', perms);

    console.log('START[accuracy=true]');
    Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    }).then(res => console.log('RESULT[accuracy=true]', res));

    console.log('START[accuracy=false]');
    Geolocation.getCurrentPosition({
      enableHighAccuracy: false,
      maximumAge: 0,
      timeout: 5000,
    }).then(res => console.log('RESULT[accuracy=false]', res));
  }

}
