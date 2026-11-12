export type LearningPriority = 'Very High' | 'High';

export interface LearningModuleSummary {
  id: string;
  title: string;
  description: string;
  topics: LearningTopicSummary[];
}

export interface LearningTopicSummary {
  id: string;
  title: string;
  priority: LearningPriority;
  summary: string;
}
