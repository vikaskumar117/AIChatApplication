import { Component, ViewEncapsulation } from '@angular/core';
import { LearningModuleController } from '../../learning-module.controller';
import { microservicesModule } from './module.data';

@Component({
  selector: 'app-learning-microservices',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../module-page.component.css', './microservices.component.css'],
  templateUrl: './microservices.component.html',
})
export class MicroservicesComponent extends LearningModuleController {
  constructor() {
    super(microservicesModule);
  }
}
