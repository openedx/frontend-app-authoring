import { type XBlock } from '@src/data/types';

import {
  getLastEditableItem,
  getLastEditableSubsection,
} from './editability';

const makeBlock = (
  id: string,
  childAddable: boolean,
  children: XBlock[] = [],
) =>
  ({
    id,
    actions: { childAddable },
    childInfo: { children },
  }) as XBlock;

describe('editability helpers', () => {
  it('returns last editable item', () => {
    const sections = [
      makeBlock('section-1', false),
      makeBlock('section-2', true),
      makeBlock('section-3', false),
      makeBlock('section-4', true),
    ];

    expect(getLastEditableItem(sections)?.id).toBe('section-4');
  });

  it('returns last editable subsection from last editable section', () => {
    const sections = [
      makeBlock('section-1', true, [
        makeBlock('subsection-1', false),
        makeBlock('subsection-2', true),
      ]),
      makeBlock('section-2', true, [
        makeBlock('subsection-3', false),
        makeBlock('subsection-4', true),
      ]),
    ];

    expect(getLastEditableSubsection(sections)).toEqual({
      data: sections[1].childInfo.children[1],
      sectionId: 'section-2',
    });
  });

  it('falls back to previous editable section when last editable section has no editable subsections', () => {
    const sections = [
      makeBlock('section-1', true, [
        makeBlock('subsection-1', false),
        makeBlock('subsection-2', true),
      ]),
      makeBlock('section-2', true, [
        makeBlock('subsection-3', false),
      ]),
    ];

    expect(getLastEditableSubsection(sections)).toEqual({
      data: sections[0].childInfo.children[1],
      sectionId: 'section-1',
    });
  });

  it('returns undefined when no editable subsection exists', () => {
    const sections = [
      makeBlock('section-1', false, [
        makeBlock('subsection-1', true),
      ]),
      makeBlock('section-2', true, [
        makeBlock('subsection-2', false),
      ]),
    ];

    expect(getLastEditableSubsection(sections)).toBeUndefined();
  });
});
