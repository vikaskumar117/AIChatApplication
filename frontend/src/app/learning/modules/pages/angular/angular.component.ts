import { Component, ViewEncapsulation } from '@angular/core';
import { LearningModuleController } from '../../learning-module.controller';
import { angularModule } from './module.data';

@Component({
  selector: 'app-learning-angular',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../module-page.component.css', './angular.component.css'],
  templateUrl: './angular.component.html',
})
export class AngularComponent extends LearningModuleController {
  constructor() {
    super(angularModule);
  }
}
