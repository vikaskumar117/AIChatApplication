import { Component, ViewEncapsulation } from '@angular/core';
import { LearningModuleController } from '../../learning-module.controller';
import { csharpFundamentalsModule } from './module.data';

@Component({
  selector: 'app-learning-csharp-fundamentals',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../module-page.component.css', './csharp-fundamentals.component.css'],
  templateUrl: './csharp-fundamentals.component.html',
})
export class CsharpFundamentalsComponent extends LearningModuleController {
  constructor() {
    super(csharpFundamentalsModule);
  }
}
