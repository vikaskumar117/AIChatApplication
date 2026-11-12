import { Component, ViewEncapsulation } from '@angular/core';
import { LearningModuleController } from '../../learning-module.controller';
import { sqlServerModule } from './module.data';

@Component({
  selector: 'app-learning-sql-server',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../module-page.component.css', './sql-server.component.css'],
  templateUrl: './sql-server.component.html',
})
export class SqlServerComponent extends LearningModuleController {
  constructor() {
    super(sqlServerModule);
  }
}
