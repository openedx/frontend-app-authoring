import {
  SETTINGS_CATEGORY_MAP,
  CATEGORY_ORDER,
  UNCATEGORIZED,
  CATEGORY_GENERAL_SETTING,
  CATEGORY_CONTENT_BLOCKS,
  CATEGORY_GRADING,
  CATEGORY_SCHEDULE,
  CATEGORY_CERTIFICATES,
  CATEGORY_ENROLLMENT_PAGE,
  CATEGORY_PAGES_AND_RESOURCES,
  CATEGORY_SPECIAL_EXAMS,
  CATEGORY_MOBILE,
  CATEGORY_INSTRUCTORS,
  CATEGORY_LEGACY_DISCUSSION,
  CATEGORY_LIBRARIES,
  CATEGORY_OTHER,
  CONTENT_BLOCKS_SUBCATEGORY_MAP,
  CONTENT_BLOCKS_SUBCATEGORY_ORDER,
} from './settingsCategories';

describe('SETTINGS_CATEGORY_MAP', () => {
  it('maps known settings to the correct categories', () => {
    expect(SETTINGS_CATEGORY_MAP.displayName).toBe(CATEGORY_GENERAL_SETTING);
    expect(SETTINGS_CATEGORY_MAP.advancedModules).toBe(CATEGORY_CONTENT_BLOCKS);
    expect(SETTINGS_CATEGORY_MAP.noGrade).toBe(CATEGORY_GRADING);
    expect(SETTINGS_CATEGORY_MAP.selfPaced).toBe(CATEGORY_SCHEDULE);
    expect(SETTINGS_CATEGORY_MAP.certNameLong).toBe(CATEGORY_CERTIFICATES);
    expect(SETTINGS_CATEGORY_MAP.catalogVisibility).toBe(CATEGORY_ENROLLMENT_PAGE);
    expect(SETTINGS_CATEGORY_MAP.allowPublicWikiAccess).toBe(CATEGORY_PAGES_AND_RESOURCES);
    expect(SETTINGS_CATEGORY_MAP.enableProctoredExams).toBe(CATEGORY_SPECIAL_EXAMS);
    expect(SETTINGS_CATEGORY_MAP.mobileAvailable).toBe(CATEGORY_MOBILE);
    expect(SETTINGS_CATEGORY_MAP.instructorInfo).toBe(CATEGORY_INSTRUCTORS);
    expect(SETTINGS_CATEGORY_MAP.discussionTopics).toBe(CATEGORY_LEGACY_DISCUSSION);
    expect(SETTINGS_CATEGORY_MAP.upstream).toBe(CATEGORY_LIBRARIES);
    expect(SETTINGS_CATEGORY_MAP.courseWideCss).toBe(CATEGORY_OTHER);
  });

  it('contains only valid category values', () => {
    const validCategories = new Set(CATEGORY_ORDER);
    Object.values(SETTINGS_CATEGORY_MAP).forEach((cat) => {
      expect(validCategories.has(cat)).toBe(true);
    });
  });
});

describe('CATEGORY_ORDER', () => {
  it('lists all 13 expected categories', () => {
    expect(CATEGORY_ORDER).toEqual([
      CATEGORY_GENERAL_SETTING,
      CATEGORY_CONTENT_BLOCKS,
      CATEGORY_GRADING,
      CATEGORY_SCHEDULE,
      CATEGORY_CERTIFICATES,
      CATEGORY_ENROLLMENT_PAGE,
      CATEGORY_PAGES_AND_RESOURCES,
      CATEGORY_SPECIAL_EXAMS,
      CATEGORY_MOBILE,
      CATEGORY_INSTRUCTORS,
      CATEGORY_LEGACY_DISCUSSION,
      CATEGORY_LIBRARIES,
      CATEGORY_OTHER,
    ]);
  });

  it('has no duplicate categories', () => {
    expect(new Set(CATEGORY_ORDER).size).toBe(CATEGORY_ORDER.length);
  });
});

describe('UNCATEGORIZED', () => {
  it('equals CATEGORY_OTHER', () => {
    expect(UNCATEGORIZED).toBe(CATEGORY_OTHER);
  });
});

describe('CONTENT_BLOCKS_SUBCATEGORY_MAP', () => {
  it('maps settings to valid subcategories', () => {
    const validSubcategories = new Set(CONTENT_BLOCKS_SUBCATEGORY_ORDER);
    Object.values(CONTENT_BLOCKS_SUBCATEGORY_MAP).forEach((subcat) => {
      expect(validSubcategories.has(subcat)).toBe(true);
    });
  });

  it('maps known keys to expected subcategories', () => {
    expect(CONTENT_BLOCKS_SUBCATEGORY_MAP.advancedModules).toBe('Settings');
    expect(CONTENT_BLOCKS_SUBCATEGORY_MAP.maxAttempts).toBe('Problems');
    expect(CONTENT_BLOCKS_SUBCATEGORY_MAP.videoSpeedOptimizations).toBe('Video');
  });
});

describe('CONTENT_BLOCKS_SUBCATEGORY_ORDER', () => {
  it('lists Settings, Problems, Video in that order', () => {
    expect(CONTENT_BLOCKS_SUBCATEGORY_ORDER).toEqual(['Settings', 'Problems', 'Video']);
  });
});
