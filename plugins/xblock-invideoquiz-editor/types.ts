/** Props XBlockEditorSlot passes to a plugin registered as its RenderWidget. */
export interface InVideoQuizEditorProps {
  blockType: string;
  blockId: string | null;
  learningContextId: string | null;
  lmsEndpointUrl: string | null;
  studioEndpointUrl: string | null;
  onClose: (() => void) | null;
  returnFunction?: (() => (result: unknown) => void) | null;
  extraProps?: Record<string, unknown> | null;
}

export interface QuizItem {
  id: string;
  problemId: string;
  time: string;
  jumpBack: string;
}

export interface VideoOption {
  id: string;
  display_name: string;
}

export interface ProblemOption {
  id: string;
  display_name: string;
}

export type TimemapValue = string | string[];
export type Timemap = Record<string, TimemapValue>;
export type JumpBackMap = Record<string, string>;
export type JumpBackInput = string | JumpBackMap | Record<string, never>;

export interface ParsedStudioView {
  videoId: string;
  timemap: Timemap;
  jumpBack: JumpBackMap;
}

export interface InVideoQuizData {
  selectedVideo: string | null;
  videos: VideoOption[];
  problems: ProblemOption[];
  quizItems: QuizItem[];
}

export interface ValidationState {
  problem: 'error' | null;
  time: 'error' | null;
  jumpBack: 'error' | null;
}
