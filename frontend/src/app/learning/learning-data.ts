import { LearningModule } from './learning.models';
import { apiModule } from './modules/api.module';
import { asyncModule } from './modules/async.module';
import { azureModule } from './modules/azure.module';
import { csharpModule } from './modules/csharp.module';
import { dataModule } from './modules/data.module';
import { designModule } from './modules/design.module';
import { genAiModule } from './modules/gen-ai.module';
import { microservicesModule } from './modules/microservices.module';
import { securityModule } from './modules/security.module';
import { systemDesignModule } from './modules/system-design.module';
import { webApiModule } from './modules/web-api.module';
import { angularModule } from './modules/angular.module';
import { efCoreModule } from './modules/ef-core.module';
import { algorithmsModule } from './modules/algorithms.module';

export const LEARNING_MODULES: LearningModule[] = [
  csharpModule,
  algorithmsModule,
  asyncModule,
  webApiModule,
  securityModule,
  apiModule,
  microservicesModule,
  designModule,
  dataModule,
  angularModule,
  efCoreModule,
  systemDesignModule,
  azureModule,
  genAiModule,
];
