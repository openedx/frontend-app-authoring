export enum CanvasContentType {
  PRESENTATION = 'presentation',
  REPORTS = 'reports',
  PROMPT_PRACTICING = 'prompt_practicing',
}

export type CanvasContent = {
  type: CanvasContentType;
  data: any;
};
