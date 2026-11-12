import { Component, ViewEncapsulation } from '@angular/core';
import { LearningModuleController } from '../../learning-module.controller';
import { efCoreDiagnosticsModule } from './module.data';

@Component({
  selector: 'app-learning-ef-core-diagnostics',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../module-page.component.css', './ef-core-diagnostics.component.css'],
  templateUrl: './ef-core-diagnostics.component.html',
})
export class EfCoreDiagnosticsComponent extends LearningModuleController {
  constructor() {
    super(efCoreDiagnosticsModule);
  }
}
