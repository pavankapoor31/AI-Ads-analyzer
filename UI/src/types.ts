export interface AdAnalysis {
  hook: SectionAnalysis;
  script: SectionAnalysis;
  visuals: SectionAnalysis;
  captions: SectionAnalysis;
  summary: string;
}

export interface SectionAnalysis {
  score: string;
  whatWorks?: string;
  whatNeedsImprovement?: string;
}