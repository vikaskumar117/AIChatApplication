import { Component, ViewEncapsulation } from '@angular/core';
import { LearningModuleController } from '../../learning-module.controller';
import { systemDesignModule } from './module.data';

@Component({
  selector: 'app-learning-system-design',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../module-page.component.css', './system-design.component.css'],
  templateUrl: './system-design.component.html',
})
export class SystemDesignComponent extends LearningModuleController {
  constructor() {
    super(systemDesignModule);
  }
}
