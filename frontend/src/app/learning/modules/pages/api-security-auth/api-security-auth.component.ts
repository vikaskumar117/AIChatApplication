import { Component, ViewEncapsulation } from '@angular/core';
import { LearningModuleController } from '../../learning-module.controller';
import { apiSecurityAuthModule } from './module.data';

@Component({
  selector: 'app-learning-api-security-auth',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../module-page.component.css', './api-security-auth.component.css'],
  templateUrl: './api-security-auth.component.html',
})
export class ApiSecurityAuthComponent extends LearningModuleController {
  constructor() {
    super(apiSecurityAuthModule);
  }
}
