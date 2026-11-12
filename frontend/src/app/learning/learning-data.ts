import { LearningModuleSummary } from './learning.models';
import { csharpFundamentalsModule } from './modules/pages/csharp-fundamentals/module.data';
import { csharpCodingAlgorithmsModule } from './modules/pages/csharp-coding-algorithms/module.data';
import { dotnetAsyncMemoryModule } from './modules/pages/dotnet-async-memory/module.data';
import { aspnetCoreWebApiModule } from './modules/pages/aspnet-core-web-api/module.data';
import { apiConcurrencyResilienceModule } from './modules/pages/api-concurrency-resilience/module.data';
import { angularModule } from './modules/pages/angular/module.data';
import { apiSecurityAuthModule } from './modules/pages/api-security-auth/module.data';
import { sqlServerModule } from './modules/pages/sql-server/module.data';
import { efCoreDiagnosticsModule } from './modules/pages/ef-core-diagnostics/module.data';
import { azureCloudModule } from './modules/pages/azure-cloud/module.data';
import { microservicesModule } from './modules/pages/microservices/module.data';
import { designPatternsModule } from './modules/pages/design-patterns/module.data';
import { systemDesignModule } from './modules/pages/system-design/module.data';
import { genAiDotnetModule } from './modules/pages/gen-ai-dotnet/module.data';

export const LEARNING_MODULES: LearningModuleSummary[] = [
  csharpFundamentalsModule,
  csharpCodingAlgorithmsModule,
  dotnetAsyncMemoryModule,
  aspnetCoreWebApiModule,
  apiConcurrencyResilienceModule,
  angularModule,
  apiSecurityAuthModule,
  sqlServerModule,
  efCoreDiagnosticsModule,
  azureCloudModule,
  microservicesModule,
  designPatternsModule,
  systemDesignModule,
  genAiDotnetModule,
];
