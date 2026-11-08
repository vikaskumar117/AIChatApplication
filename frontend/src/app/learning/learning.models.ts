export interface LearningTopic {
  id: string;
  title: string;
  priority: 'Very High' | 'High';
  summary: string;
  concepts: [definition: string, why: string, internals: string];
  flow: string[];
  example: string;
  code: string;
  tradeoffs: [advantages: string[], disadvantages: string[]];
  guidance: [whenToUse: string, whenToAvoid: string];
  questions: string[];
  scenario: string;
  sources?: { label: string; url: string }[];
  visual: LessonVisual;
}

export interface LessonVisual {
  diagram: { label: string; detail: string; code?: string }[];
  diagramNote?: string;
  summary: string;
  exampleSteps?: string[];
  keyTakeaways?: string[];
  relatedConcepts?: string[];
  commonMistakes?: string[];
  bestPractices?: string[];
  exampleTables?: {
    title: string;
    headers: string[];
    rows: string[][];
  }[];
  executionPlan?: { operator: string; purpose: string }[];
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  topics: LearningTopic[];
}

export function topic(
  id: string,
  title: string,
  priority: LearningTopic['priority'],
  summary: string,
  concepts: LearningTopic['concepts'],
  flow: string[],
  example: string,
  code: string,
  tradeoffs: LearningTopic['tradeoffs'],
  guidance: LearningTopic['guidance'],
  questions: string[],
  scenario: string,
  sources?: LearningTopic['sources'],
  visual?: Partial<LessonVisual>,
): LearningTopic {
  return {
    id, title, priority, summary, concepts, flow, example, code, tradeoffs, guidance, questions, scenario, sources,
    visual: {
      diagram: visual?.diagram ?? flow.map((label, index) => ({
        label,
        detail: index === 0 ? concepts[0] : index === 1 ? concepts[2] : example,
      })),
      summary: visual?.summary ?? `${concepts[0]} ${concepts[1]}`,
      keyTakeaways: visual?.keyTakeaways ?? [concepts[0], concepts[1]],
      commonMistakes: visual?.commonMistakes ?? [guidance[1]],
      bestPractices: visual?.bestPractices ?? [guidance[0]],
      ...visual,
    },
  };
}
