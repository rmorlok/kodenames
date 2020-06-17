import { NgModule } from '@angular/core';
import { MaterialModule } from '../material.module';
import { CardsComponent } from '@views/cards/cards.component';
import { GameComponent } from '@views/game/game.component';

const components = [
    CardsComponent,
    GameComponent
];

@NgModule({
    declarations: components,
    imports: [
        MaterialModule
    ],
    entryComponents: [],
    exports: components,
})
export class ViewsModule {
}
