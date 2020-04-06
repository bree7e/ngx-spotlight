import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxSpotlightModule } from 'projects/spotlight/src/public-api';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxSpotlightModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
