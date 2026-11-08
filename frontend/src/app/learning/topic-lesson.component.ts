import { Component, effect, input, output, signal } from '@angular/core';
import { LearningTopic } from './learning.models';

@Component({
  selector: 'app-topic-lesson',
  styleUrl: './topic-lesson.component.css',
  templateUrl: './topic-lesson.component.html',
})
export class TopicLessonComponent {
  readonly topic = input.required<LearningTopic>();
  protected readonly activePage = signal<1 | 2>(1);
  protected readonly back = output<void>();

  constructor() {
    effect(() => {
      this.topic().id;
      this.activePage.set(1);
    });
  }
}
