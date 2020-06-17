import { NgModule } from '@angular/core';
import { MaterialModule } from '../material.module';
import { CardsComponent } from '@views/cards/cards.component';

const components = [
    CardsComponent
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
