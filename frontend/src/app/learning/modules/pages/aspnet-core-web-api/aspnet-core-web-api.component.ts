import { Component, ViewEncapsulation } from '@angular/core';
import { LearningModuleController } from '../../learning-module.controller';
import { aspnetCoreWebApiModule } from './module.data';

@Component({
  selector: 'app-learning-aspnet-core-web-api',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../module-page.component.css', './aspnet-core-web-api.component.css'],
  templateUrl: './aspnet-core-web-api.component.html',
})
export class AspnetCoreWebApiComponent extends LearningModuleController {
  constructor() {
    super(aspnetCoreWebApiModule);
  }
}
