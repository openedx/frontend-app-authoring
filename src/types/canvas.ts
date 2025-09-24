export enum CanvasContentType {
  PRESENTATION = 'presentation',
  REPORTS = 'reports',
  PLAYGROUND = 'playground',
}

export type CanvasContent = {
  type: CanvasContentType;
  data: any;
};
