import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { HomeComponent } from './pages/home/home.component';
import { BaseChartDirective } from 'ng2-charts';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent, HomeComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, provideFirebaseApp(() => initializeApp({
    apiKey: "AIzaSyCy8Fzm8jRGFS4Drc3hCEqQSoF5yrlOIrw",
    authDomain: "medvibe-dc5be.firebaseapp.com",
    projectId: "medvibe-dc5be",
    storageBucket: "medvibe-dc5be.appspot.com",
    messagingSenderId: "916367791068",
    appId: "1:916367791068:web:8125e5495fddb6a4603519",
    measurementId: "G-4NT3G3EZPB"
  })),
    provideFirestore(() => getFirestore()),
    BaseChartDirective, FormsModule, ReactiveFormsModule
  ],
  providers: [provideCharts(withDefaultRegisterables()), { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
