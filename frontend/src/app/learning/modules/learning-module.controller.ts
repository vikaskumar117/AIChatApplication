import { HttpClient } from '@angular/common/http';
import { DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, catchError, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { LearningModuleSummary } from '../learning.models';

type LessonResult =
  | { kind: 'empty' }
  | { kind: 'loaded'; html: string }
  | { kind: 'error'; message: string };

export abstract class LearningModuleController {
  protected readonly topicId = signal<string | null>(null);
  protected readonly activeTab = signal<'concepts' | 'example'>('concepts');
  protected readonly lessonHtml = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly selectedTopic = computed(
    () => this.module.topics.find((topic) => topic.id === this.topicId()) ?? null,
  );
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected constructor(protected readonly module: LearningModuleSummary) {
    const activeTab$ = toObservable(this.activeTab);

    this.route.paramMap.pipe(
      map((params) => params.get('topicId')),
      distinctUntilChanged(),
      switchMap((topicId) => {
        this.topicId.set(topicId);
        this.activeTab.set('concepts');
        return activeTab$.pipe(
          distinctUntilChanged(),
          switchMap((tab) => this.loadLesson(topicId, tab)),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((result) => {
      this.loading.set(false);
      this.lessonHtml.set(result.kind === 'loaded' ? result.html : null);
      this.error.set(result.kind === 'error' ? result.message : null);
    });
  }

  protected selectTab(tab: 'concepts' | 'example'): void {
    this.activeTab.set(tab);
  }

  protected openTopic(topicId: string): void {
    void this.router.navigate(['/learning', this.module.id, topicId]);
  }

  protected backToModules(): void {
    void this.router.navigate(['/learning']);
  }

  protected backToTopics(): void {
    void this.router.navigate(['/learning', this.module.id]);
  }

  private loadLesson(topicId: string | null, tab: 'concepts' | 'example'): Observable<LessonResult> {
    this.lessonHtml.set(null);
    this.error.set(null);

    if (!topicId) {
      this.loading.set(false);
      return of({ kind: 'empty' });
    }

    const topic = this.module.topics.find((item) => item.id === topicId);
    if (!topic) {
      this.loading.set(false);
      return of({ kind: 'error', message: 'This topic could not be found in the selected module.' });
    }

    this.loading.set(true);
    return this.http
      .get(`/learning-content/${this.module.id}/${topic.id}.${tab}.html`, { responseType: 'text' })
      .pipe(
        map((html): LessonResult => ({ kind: 'loaded', html })),
        catchError(() =>
          of<LessonResult>({
            kind: 'error',
            message: `Unable to load the ${tab} page for this lesson. Please try again or choose another topic.`,
          }),
        ),
      );
  }
}
