import { Component, computed, signal } from '@angular/core';
import { LEARNING_MODULES } from './learning/learning-data';
import { TopicLessonComponent } from './learning/topic-lesson.component';

@Component({
  selector: 'app-learning-page',
  imports: [TopicLessonComponent],
  styleUrl: './learning-page.css',
  templateUrl: './learning-page.html',
})
export class LearningPage {
  protected readonly modules = LEARNING_MODULES;
  protected readonly selectedModule = signal<string | null>(null);
  protected readonly selectedTopicId = signal<string | null>(null);
  protected readonly currentModule = computed(
    () => this.modules.find((module) => module.id === this.selectedModule()) ?? null,
  );
  protected readonly currentTopic = computed(
    () => this.currentModule()?.topics.find((topic) => topic.id === this.selectedTopicId()) ?? null,
  );

  protected selectModule(moduleId: string): void {
    this.selectedModule.set(moduleId);
    this.selectedTopicId.set(null);
  }

  protected selectTopic(moduleId: string, topicId: string): void {
    this.selectedModule.set(moduleId);
    this.selectedTopicId.set(topicId);
  }

  protected showModule(moduleId: string | null): void {
    this.selectedModule.set(moduleId);
    this.selectedTopicId.set(null);
  }

  protected showHome(): void {
    this.showModule(null);
  }
}
