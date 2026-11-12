import { Component, ViewEncapsulation } from '@angular/core';
import { LearningModuleController } from '../../learning-module.controller';
import { csharpCodingAlgorithmsModule } from './module.data';

@Component({
  selector: 'app-learning-csharp-coding-algorithms',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../module-page.component.css', './csharp-coding-algorithms.component.css'],
  templateUrl: './csharp-coding-algorithms.component.html',
})
export class CsharpCodingAlgorithmsComponent extends LearningModuleController {
  constructor() {
    super(csharpCodingAlgorithmsModule);
  }
}
