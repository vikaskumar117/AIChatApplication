import { Component, ViewEncapsulation } from '@angular/core';
import { LearningModuleController } from '../../learning-module.controller';
import { designPatternsModule } from './module.data';

@Component({
  selector: 'app-learning-design-patterns',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../module-page.component.css', './design-patterns.component.css'],
  templateUrl: './design-patterns.component.html',
})
export class DesignPatternsComponent extends LearningModuleController {
  constructor() {
    super(designPatternsModule);
  }
}
