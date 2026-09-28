import { StrictDict } from '../../utils';

export const blockTypes = StrictDict({
  html: 'html',
  video: 'video',
  problem: 'problem',
  // ADDED_EDITORS GO BELOW
  video_upload: 'video_upload',
  games: 'games',
  pdf: 'pdf',
});

/**
 * Block types whose built-in editor works through the block's own XBlock
 * handlers, so the block must exist before the editor opens. Every other
 * editor creates the block itself on Save when opened without one.
 */
export const editorsNeedingExistingBlock: ReadonlySet<string> = new Set([blockTypes.games]);
