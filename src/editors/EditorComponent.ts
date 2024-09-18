/** Shared interface that all Editor components (like ProblemEditor) adhere to */
export interface EditorComponent {
  onClose: (() => void) | null;
  // TODO: get a better type for the 'result' here
  returnFunction?: (() => (result: any) => void) | null;
}
