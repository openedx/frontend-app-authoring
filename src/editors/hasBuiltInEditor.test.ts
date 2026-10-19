import { waffleFlagDefaults } from '@src/data/api';
import { hasBuiltInEditor } from './hasBuiltInEditor';

describe('hasBuiltInEditor', () => {
  it('is true for a block type this app has an editor for', () => {
    expect(hasBuiltInEditor('games', waffleFlagDefaults)).toBe(true);
    expect(hasBuiltInEditor('html', waffleFlagDefaults)).toBe(true);
  });

  it('is false for a block type this app has no editor for', () => {
    expect(hasBuiltInEditor('drag-and-drop-v2', waffleFlagDefaults)).toBe(false);
    expect(hasBuiltInEditor('', waffleFlagDefaults)).toBe(false);
  });

  // The PDF block has a studio_view of its own; an operator may prefer it.
  it('honours the opt-out flag for a block type that has one', () => {
    expect(hasBuiltInEditor('pdf', { ...waffleFlagDefaults, useNewPdfEditor: true })).toBe(true);
    expect(hasBuiltInEditor('pdf', { ...waffleFlagDefaults, useNewPdfEditor: false })).toBe(false);
  });
});
