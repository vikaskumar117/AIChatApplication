import { Component, ViewEncapsulation } from '@angular/core';
import { LearningModuleController } from '../../learning-module.controller';
import { dotnetAsyncMemoryModule } from './module.data';

@Component({
  selector: 'app-learning-dotnet-async-memory',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../module-page.component.css', './dotnet-async-memory.component.css'],
  templateUrl: './dotnet-async-memory.component.html',
})
export class DotnetAsyncMemoryComponent extends LearningModuleController {
  constructor() {
    super(dotnetAsyncMemoryModule);
  }
}
