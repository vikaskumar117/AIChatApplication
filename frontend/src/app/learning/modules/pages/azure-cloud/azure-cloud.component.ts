import { Component, ViewEncapsulation } from '@angular/core';
import { LearningModuleController } from '../../learning-module.controller';
import { azureCloudModule } from './module.data';

@Component({
  selector: 'app-learning-azure-cloud',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../module-page.component.css', './azure-cloud.component.css'],
  templateUrl: './azure-cloud.component.html',
})
export class AzureCloudComponent extends LearningModuleController {
  constructor() {
    super(azureCloudModule);
  }
}
