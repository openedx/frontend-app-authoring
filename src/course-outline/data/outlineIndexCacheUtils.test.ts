import { removeItemFromOutlineIndexData } from './outlineIndexCacheUtils';

// ─── Helpers ───────────────────────────────────────────────────────────────
const key = (type: string, id: string) => `block-v1:org+type@${type}+block@${id}`;

const section = (id: string, subs: any[] = []) => ({
  id: key('chapter', id),
  category: 'chapter',
  childInfo: { children: subs.map(s => ({ ...s, category: 'sequential', childInfo: { children: s.childInfo?.children || [] } })) },
});

const subsection = (id: string, units: any[] = []) => ({
  id: key('sequential', id),
  category: 'sequential',
  childInfo: { children: units.map(u => ({ ...u, category: 'vertical', childInfo: { children: [] } })) },
});

const unit = (id: string) => ({
  id: key('vertical', id),
  category: 'vertical',
  childInfo: { children: [] },
});

const makeTree = (sections: any[]) => ({
  courseStructure: {
    childInfo: { children: sections },
  },
});

// ─── Tests ─────────────────────────────────────────────────────────────────
describe('removeItemFromOutlineIndexData', () => {
  const sub1 = subsection('sub-1', [unit('unit-1a'), unit('unit-1b')]);
  const sub2 = subsection('sub-2', [unit('unit-2a')]);
  const sub3 = subsection('sub-3', []);
  const secA = section('sec-a', [sub1, sub2]);
  const secB = section('sec-b', [sub3]);

  it('removes a chapter (top-level)', () => {
    const tree = makeTree([secA, secB]);
    const result = removeItemFromOutlineIndexData(tree, key('chapter', 'sec-a'), {});
    expect(result.courseStructure.childInfo.children.map((s: any) => s.id)).toEqual([key('chapter', 'sec-b')]);
  });

  it('removes a sequential from its parent section', () => {
    const tree = makeTree([secA, secB]);
    const result = removeItemFromOutlineIndexData(tree, key('sequential', 'sub-1'), { sectionId: key('chapter', 'sec-a') });
    const sections = result.courseStructure.childInfo.children;
    expect(sections.find((s: any) => s.id === key('chapter', 'sec-a')).childInfo.children.map((s: any) => s.id)).toEqual([key('sequential', 'sub-2')]);
    expect(sections.find((s: any) => s.id === key('chapter', 'sec-b')).childInfo.children.map((s: any) => s.id)).toEqual([key('sequential', 'sub-3')]);
  });

  it('removes a vertical from its parent subsection', () => {
    const tree = makeTree([secA, secB]);
    const result = removeItemFromOutlineIndexData(tree, key('vertical', 'unit-1a'), { sectionId: key('chapter', 'sec-a'), subsectionId: key('sequential', 'sub-1') });
    const sections = result.courseStructure.childInfo.children;
    const sub1result = sections.find((s: any) => s.id === key('chapter', 'sec-a')).childInfo.children.find((s: any) => s.id === key('sequential', 'sub-1'));
    expect(sub1result.childInfo.children.map((u: any) => u.id)).toEqual([key('vertical', 'unit-1b')]);
  });

  it('returns unchanged when id not found', () => {
    const tree = makeTree([secA]);
    const result = removeItemFromOutlineIndexData(tree, key('chapter', 'ghost'), { sectionId: key('chapter', 'sec-a'), subsectionId: key('sequential', 'sub-1') });
    expect(result).toStrictEqual(tree);
  });

  it('returns old when tree is null/undefined', () => {
    expect(removeItemFromOutlineIndexData(null, 'x', {})).toBeNull();
    expect(removeItemFromOutlineIndexData(undefined, 'x', {})).toBeUndefined();
  });

  it('returns old when courseStructure is missing', () => {
    const tree = { notStructure: true };
    expect(removeItemFromOutlineIndexData(tree, 'x', {})).toBe(tree);
  });
});
