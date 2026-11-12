import { Component, ViewEncapsulation } from '@angular/core';
import { LearningModuleController } from '../../learning-module.controller';
import { genAiDotnetModule } from './module.data';

@Component({
  selector: 'app-learning-gen-ai-dotnet',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../module-page.component.css', './gen-ai-dotnet.component.css'],
  templateUrl: './gen-ai-dotnet.component.html',
})
export class GenAiDotnetComponent extends LearningModuleController {
  constructor() {
    super(genAiDotnetModule);
  }
}
