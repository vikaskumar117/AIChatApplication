import { Component, ViewEncapsulation } from '@angular/core';
import { LearningModuleController } from '../../learning-module.controller';
import { apiConcurrencyResilienceModule } from './module.data';

@Component({
  selector: 'app-learning-api-concurrency-resilience',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../module-page.component.css', './api-concurrency-resilience.component.css'],
  templateUrl: './api-concurrency-resilience.component.html',
})
export class ApiConcurrencyResilienceComponent extends LearningModuleController {
  constructor() {
    super(apiConcurrencyResilienceModule);
  }
}
