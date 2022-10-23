/************************************************************************
 *                                                                      *
 * KEEP THE APP MODULE CLEAN                                            *
 *                                                                      *
 * NOTE: Your entry module does not necessarily have to be lazy loaded  *
 *                                                                      *
 ************************************************************************/

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard.component';

@NgModule({
  declarations: [DashboardComponent],
  imports: [CommonModule],
  exports: [DashboardComponent]
})
export class DashboardModule {}
