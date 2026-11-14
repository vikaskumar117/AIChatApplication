import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import learningData from './learning/learning-data.json';

@Component({
  selector: 'app-learning-page',
  styleUrl: './learning-page.css',
  templateUrl: './learning-page.html',
})
export class LearningPage {
  protected readonly modules = learningData;
  protected readonly totalTopics = learningData.reduce(
    (total, module) => total + module.topics.length,
    0,
  );
  protected readonly selectedModuleId = signal<string | null>(null);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => this.selectedModuleId.set(params.get('selected')));
  }

  protected openModule(moduleId: string): void {
    void this.router.navigate(['/learning', moduleId], {
      queryParams: { selected: moduleId },
    });
  }
}
