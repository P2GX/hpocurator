import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { AppComponent } from "./app/app.component";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { routes } from './app/app.routes';


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      BrowserAnimationsModule,
      MatMenuModule,
      MatButtonModule
    ),
  ],
}).catch(err => console.error(err));