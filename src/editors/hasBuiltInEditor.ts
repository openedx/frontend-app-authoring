import type { WaffleFlagsStatus } from '@src/data/api';
import supportedEditors from './supportedEditors';

type OptOutFlags = Partial<Record<string, keyof WaffleFlagsStatus>>;

/**
 * Block types whose built-in editor an operator can switch off, in favour of
 * the block's own `studio_view`. A type is listed here only when that view
 * exists; the games block, say, has none, so its editor cannot be opted out of.
 */
const optOutFlags: OptOutFlags = {
  pdf: 'useNewPdfEditor',
};

/**
 * Whether this app should open its own editor for `blockType`.
 *
 * `supportedEditors` is the registry: a type is editable here when it has an
 * entry, subject to that type's opt-out flag if it has one. This is the one
 * place that decides it, for both editing an existing block and creating one.
 */
export const hasBuiltInEditor = (
  blockType: string,
  waffleFlags: Pick<WaffleFlagsStatus, 'useNewPdfEditor'>,
): boolean => {
  if (!Object.prototype.hasOwnProperty.call(supportedEditors, blockType)) {
    return false;
  }
  const optOutFlag = optOutFlags[blockType];
  return optOutFlag ? !!waffleFlags[optOutFlag] : true;
};
