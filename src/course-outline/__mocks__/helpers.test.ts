import { buildTestOutline, type NodeSpec } from './helpers';

describe('buildTestOutline', () => {
  // -----------------------------------------------------------------------
  // No-arg / defaults
  // -----------------------------------------------------------------------
  it('returns full CourseOutline shape when called with no args', () => {
    const outline = buildTestOutline();

    expect(outline.courseStructure).toBeDefined();
    expect((outline.courseStructure as any).childInfo).toBeDefined();
    expect((outline.courseStructure as any).actions).toBeDefined();
    expect(outline.languageCode).toBe('en');
    expect(outline.courseReleaseDate).toBe('');
  });

  it('produces 4 default sections with uneven nesting', () => {
    const outline = buildTestOutline();
    const children = (outline.courseStructure as any).childInfo.children;
    expect(children).toHaveLength(4);

    // Section 1 has 1 subsection with 1 unit
    const [s1] = children;
    expect(s1.id).toBe('block-v1:test+course+2025+type@chapter+block@section-1');
    expect(s1.childInfo.children).toHaveLength(1);
    expect(s1.childInfo.children[0].childInfo.children).toHaveLength(1);

    // Section 2 has 2 subsections (2B has 2 units, 2A has 0)
    const [, s2] = children;
    expect(s2.childInfo.children).toHaveLength(2);
    expect(s2.childInfo.children[0].id).toBe('block-v1:test+course+2025+type@sequential+block@subsection-2a');
    expect(s2.childInfo.children[0].childInfo.children).toHaveLength(0);
    expect(s2.childInfo.children[1].childInfo.children).toHaveLength(2);

    // Section 3, 4: no child specs → leaf nodes with empty children
    const [, , s3, s4] = children;
    expect(s3.childInfo.children).toHaveLength(0);
    expect(s4.childInfo.children).toHaveLength(0);
  });

  // -----------------------------------------------------------------------
  // Shorthand array
  // -----------------------------------------------------------------------
  it('builds tree from shorthand array', () => {
    const outline = buildTestOutline([{ id: 'sec-1' }]);
    const children = (outline.courseStructure as any).childInfo.children;
    expect(children).toHaveLength(1);
    expect(children[0].id).toBe('sec-1');
    expect(children[0].category).toBe('chapter');
  });

  it('fills defaults on every node — no undefined values', () => {
    const outline = buildTestOutline([{ id: 's1', children: [{ id: 'sub1' }] }]);

    function walk(obj: unknown, path: string): void {
      if (obj === undefined) {
        throw new Error(`undefined at ${path}`);
      }
      if (obj === null || typeof obj !== 'object') { return; }
      if (Array.isArray(obj)) {
        obj.forEach((v, i) => walk(v, `${path}[${i}]`));
        return;
      }
      for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        walk(v, `${path}.${k}`);
      }
    }

    expect(() => walk(outline, 'outline')).not.toThrow();

    // Specific node checks
    const s1 = (outline.courseStructure as any).childInfo.children[0];
    expect(s1.actions.deletable).toBe(true);
    expect(s1.actions.draggable).toBe(true);
    expect(s1.showCorrectness).toBe('always');
    expect(s1.hasExplicitStaffLock).toBe(false);
    expect(s1.editedOn).toBe('2023-08-23T12:35:00Z');
    expect(s1.visibilityState).toBe('');

    // Leaf (sequential) still has childInfo with empty children
    const sub1 = s1.childInfo.children[0];
    expect(sub1.childInfo).toBeDefined();
    expect(sub1.childInfo.children).toEqual([]);
    expect(sub1.category).toBe('sequential');

    // Top-level fields
    expect(outline.deprecatedBlocksInfo).toBeDefined();
    expect(outline.initialState).toBeDefined();
    expect(outline.rerunNotificationId).toBeNull();
    expect(outline.createdOn).toBeUndefined();
  });

  // -----------------------------------------------------------------------
  // Node-level override
  // -----------------------------------------------------------------------
  it('node override changes only that node, siblings keep defaults', () => {
    const specA: NodeSpec = { id: 's1', overrides: { hasExplicitStaffLock: true } };
    const specB: NodeSpec = { id: 's2' };

    const outline = buildTestOutline({ sections: [specA, specB] });
    const children = (outline.courseStructure as any).childInfo.children;

    expect(children[0].id).toBe('s1');
    expect(children[0].hasExplicitStaffLock).toBe(true);

    expect(children[1].id).toBe('s2');
    expect(children[1].hasExplicitStaffLock).toBe(false);
  });

  // -----------------------------------------------------------------------
  // Top-level override
  // -----------------------------------------------------------------------
  it('top-level override merges shallow', () => {
    const outline = buildTestOutline({
      overrides: { languageCode: 'fr', notificationDismissUrl: '/custom/dismiss' },
    });

    expect(outline.languageCode).toBe('fr');
    expect(outline.notificationDismissUrl).toBe('/custom/dismiss');
    // Other defaults preserved
    expect(outline.courseReleaseDate).toBe('');
    expect(outline.lmsLink).toBe('');
  });

  it('courseStructure override deep-merges preserving childInfo and actions', () => {
    const outline = buildTestOutline({
      sections: [{ id: 'x' }],
      overrides: {
        courseStructure: { displayName: 'Custom Course', videoSharingOptions: 'all-on' },
      },
    });

    const cs = outline.courseStructure as any;
    expect(cs.displayName).toBe('Custom Course');
    expect(cs.videoSharingOptions).toBe('all-on');
    // childInfo (from build) is preserved
    expect(cs.childInfo).toBeDefined();
    expect(cs.childInfo.children).toHaveLength(1);
    // actions defaults preserved
    expect(cs.actions.deletable).toBe(true);
  });
});
