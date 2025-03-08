import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule} from '@angular/common/http';
import { LayoutModule } from '@angular/cdk/layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { MaterialModule } from './material.module';
import { MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS } from '@angular/material/progress-spinner';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';

import { FlexLayoutModule } from '@angular/flex-layout';

import { AppComponent } from './app.component';

// Import routing module
import { AppRoutingModule } from './app.routing';
import { LayoutComponent } from './layout/layout.component';
import { environment } from '@environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { CommonModule } from '@angular/common';
import { ViewsModule } from '@views/views.module';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    LayoutModule,
    MaterialModule,
    ReactiveFormsModule,
    DragDropModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    ViewsModule,
  ],
  declarations: [
    AppComponent,
    LayoutComponent
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
    {
      provide: MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS,
      useValue: { diameter: 40 },
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 4000 },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
