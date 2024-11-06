import { adoptCourseSectionUrl } from './utils';

describe('adoptCourseSectionUrl', () => {
  it('should transform container URL correctly', () => {
    const params = {
      courseId: 'some-course-id',
      parentUnitId: 'some-sequence-id',
      unitId: 'some-unit-id',
      url: '/container/some-unit-id',
    };
    const result = adoptCourseSectionUrl(params);
    expect(result).toBe(`/course/${params.courseId}/container/${params.unitId}/${params.parentUnitId}`);
  });

  it('should return original URL if no transformation is applied', () => {
    const params = {
      courseId: 'some-course-id',
      parentUnitId: 'some-sequence-id',
      unitId: 'some-unit-id',
      url: '/some/other/url',
    };
    const result = adoptCourseSectionUrl(params);
    expect(result).toBe('/some/other/url');
  });
});
