/************************************************************************
 *                                                                      *
 * KEEP THE APP MODULE CLEAN                                            *
 *                                                                      *
 * NOTE: Your entry module does not necessarily have to be lazy loaded  *
 *                                                                      *
 ************************************************************************/

import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardModule } from './dashboard/dashboard.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    RouterModule,
    DashboardModule,
  ],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: 'BASE_URL',
      useValue: 'http://localhost:3000'
    }
  ]
})
export class AppModule {}
