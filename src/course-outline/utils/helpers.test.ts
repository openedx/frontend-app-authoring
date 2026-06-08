import { buildTestOutline, buildOutlineIndex, type NodeSpec } from '../__mocks__/helpers';

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

describe('buildOutlineIndex', () => {
  // -----------------------------------------------------------------------
  // Type compliance
  // -----------------------------------------------------------------------
  it('returns object matching CourseOutline type shape', () => {
    const outline = buildOutlineIndex();

    // Required CourseOutline fields
    expect(outline.courseReleaseDate).toBe('');
    expect(outline.courseStructure).toBeDefined();
    expect(outline.deprecatedBlocksInfo).toBeDefined();
    expect(outline.discussionsIncontextLearnmoreUrl).toBe('');
    expect(outline.initialState).toBeDefined();
    expect(outline.initialUserClipboard).toBeDefined();
    expect(outline.languageCode).toBe('en');
    expect(outline.lmsLink).toBe('');
    expect(outline.mfeProctoredExamSettingsUrl).toBe('');
    expect(outline.notificationDismissUrl).toBe('');
    expect(outline.proctoringErrors).toEqual([]);
    expect(outline.reindexLink).toBe('');
    expect(outline.rerunNotificationId).toBeNull();
  });

  it('proctoringErrors is typed as string[]', () => {
    const outline = buildOutlineIndex();
    expect(Array.isArray(outline.proctoringErrors)).toBe(true);
    // Must accept string assignment
    const errors: string[] = outline.proctoringErrors;
    expect(errors).toEqual([]);
  });

  // -----------------------------------------------------------------------
  // Overload parity with buildTestOutline
  // -----------------------------------------------------------------------
  it('no-arg produces 4 default sections', () => {
    const outline = buildOutlineIndex();
    const children = (outline.courseStructure as any).childInfo.children;
    expect(children).toHaveLength(4);
  });

  it('shorthand array overload', () => {
    const outline = buildOutlineIndex([{ id: 'sec-1' }]);
    const children = (outline.courseStructure as any).childInfo.children;
    expect(children).toHaveLength(1);
    expect(children[0].id).toBe('sec-1');
  });

  it('options overload with sections and overrides', () => {
    const outline = buildOutlineIndex({
      sections: [{ id: 'x' }],
      overrides: { languageCode: 'de' },
    });
    expect(outline.languageCode).toBe('de');
    expect((outline.courseStructure as any).childInfo.children).toHaveLength(1);
  });

  it('courseStructure override deep-merge', () => {
    const outline = buildOutlineIndex({
      overrides: { courseStructure: { displayName: 'Custom' } },
    });
    expect(outline.courseStructure.displayName).toBe('Custom');
    expect(outline.courseStructure.childInfo).toBeDefined();
  });

  // -----------------------------------------------------------------------
  // Optional field defaults
  // -----------------------------------------------------------------------
  it('optional CourseOutline fields are undefined by default', () => {
    const outline = buildOutlineIndex();
    expect(outline.discussionsSettings).toBeUndefined();
    expect(outline.advanceSettingsUrl).toBeUndefined();
    expect(outline.isCustomRelativeDatesActive).toBeUndefined();
    expect(outline.createdOn).toBeUndefined();
  });

  it('optional fields can be set via overrides', () => {
    const outline = buildOutlineIndex({
      overrides: {
        discussionsSettings: { providerType: 'test', enableGradedUnits: true },
        advanceSettingsUrl: '/some/path',
        isCustomRelativeDatesActive: true,
        createdOn: '2025-01-01',
      },
    });
    expect(outline.discussionsSettings).toEqual({ providerType: 'test', enableGradedUnits: true });
    expect(outline.advanceSettingsUrl).toBe('/some/path');
    expect(outline.isCustomRelativeDatesActive).toBe(true);
    expect(outline.createdOn).toBe('2025-01-01');
  });
});
