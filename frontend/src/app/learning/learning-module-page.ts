import { HttpClient } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  ViewEncapsulation,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import learningData from './learning-data.json';

type LearningModule = (typeof learningData)[number];
type LearningTopic = LearningModule['topics'][number];

@Component({
  selector: 'app-learning-module-page',
  encapsulation: ViewEncapsulation.None,
  styleUrl: './learning-module-page.css',
  templateUrl: './learning-module-page.html',
})
export class LearningModulePage {
  protected readonly module = signal<LearningModule | null>(null);
  protected readonly topicId = signal<string | null>(null);
  protected readonly lessonHtml = signal('');
  protected readonly error = signal('');
  protected readonly topicsVisible = signal(true);
  protected readonly topics = computed(() => this.module()?.topics ?? []);
  protected readonly selectedTopic = computed<LearningTopic | null>(() => {
    const topics = this.topics();
    return topics.find((topic) => topic.id === this.topicId()) ?? topics[0] ?? null;
  });

  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => ({
          moduleId: params.get('moduleId'),
          topicId: params.get('topicId'),
        })),
        distinctUntilChanged(
          (previous, current) =>
            previous.moduleId === current.moduleId && previous.topicId === current.topicId,
        ),
        switchMap(({ moduleId, topicId }) => {
          const currentModule = learningData.find((item) => item.id === moduleId) ?? null;
          this.module.set(currentModule);
          this.topicId.set(topicId);
          this.lessonHtml.set('');

          if (!currentModule) {
            this.error.set('Module not found.');
            return of('');
          }

          const topic = currentModule.topics.find((item) => item.id === topicId)
            ?? (topicId === null ? currentModule.topics[0] : null);
          if (!topic) {
            this.error.set('Topic not found.');
            return of('');
          }

          this.error.set('');
          return this.http
            .get(`/learning-content/${currentModule.id}/${topic.id}.html`, { responseType: 'text' })
            .pipe(
              catchError(() => {
                this.error.set('Unable to load this topic HTML file.');
                return of('');
              }),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((html) => this.lessonHtml.set(html));
  }

  protected openTopic(topicId: string): void {
    const currentModule = this.module();
    if (currentModule) {
      void this.router.navigate(['/learning', currentModule.id, topicId]);
    }
  }

  protected toggleTopics(): void {
    this.topicsVisible.update((visible) => !visible);
  }

  protected backToModules(): void {
    const currentModule = this.module();
    void this.router.navigate(['/learning'], {
      queryParams: currentModule ? { selected: currentModule.id } : undefined,
    });
  }
}
