import { NgModule } from '@angular/core';
import { MaterialModule } from '../material.module';
import { CardsComponent } from '@views/cards/cards.component';
import { TableComponent } from '@views/table/table.component';
import { CommonModule } from '@angular/common';
import { NewPlayerComponent } from '@views/new-player/new-player.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PickTableComponent } from '@views/pick-table/pick-table.component';
import { LobbyComponent } from '@views/lobby/lobby.component';

const components = [
    CardsComponent,
    NewPlayerComponent,
    TableComponent,
    PickTableComponent,
    LobbyComponent
];

@NgModule({
    declarations: components,
    imports: [
        CommonModule,
        MaterialModule,
        FlexLayoutModule,
        FormsModule,
        ReactiveFormsModule
    ],
    entryComponents: [],
    exports: components,
})
export class ViewsModule {
}
