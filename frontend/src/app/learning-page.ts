import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LEARNING_MODULES } from './learning/learning-data';

@Component({
  selector: 'app-learning-page',
  styleUrl: './learning-page.css',
  templateUrl: './learning-page.html',
})
export class LearningPage {
  protected readonly modules = LEARNING_MODULES;
  private readonly router = inject(Router);

  protected openModule(moduleId: string): void {
    void this.router.navigate(['/learning', moduleId]);
  }
}
