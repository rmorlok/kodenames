import { NgModule } from '@angular/core';
import { MaterialModule } from '../material.module';
import { CardsComponent } from '@views/cards/cards.component';
import { GameComponent } from '@views/game/game.component';
import { CommonModule } from '@angular/common';
import { NewPlayerComponent } from '@views/new-player/new-player.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PickGameComponent } from '@views/pick-game/pick-game.component';

const components = [
    CardsComponent,
    NewPlayerComponent,
    GameComponent,
    PickGameComponent
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
