import { initializeMocks } from '@src/testUtils';

import { courseSectionVerticalMock } from '../__mocks__';
import { getCourseSectionVerticalApiUrl, getVerticalData } from './api';

let axiosMock;
const unitId = courseSectionVerticalMock.xblock_info.id;

describe('getVerticalData', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  it('addresses the container by its usage key', () => {
    expect(getCourseSectionVerticalApiUrl(unitId)).toMatch(
      new RegExp(`/api/authoring/v2/containers/${unitId.replace(/[+]/g, '\\+')}/$`),
    );
  });

  it('requests the full view, which holds the unit page data', async () => {
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(unitId), { params: { view: 'full' } })
      .reply(200, courseSectionVerticalMock);

    const result: any = await getVerticalData(unitId);

    expect(axiosMock.history.get).toHaveLength(1);
    expect(axiosMock.history.get[0].params).toEqual({ view: 'full' });
    expect(result.xblockInfo.id).toEqual(unitId);
    expect(result.xblockInfo.readOnly).toEqual(false);
    expect(result.prevUrl).toEqual(courseSectionVerticalMock.prev_url);
    expect(result.courseSequenceIds).toEqual(courseSectionVerticalMock.course_sequence_ids);
    expect(result.sequence.id).toEqual(courseSectionVerticalMock.subsection_location);
    expect(result.units.map((unit) => unit.id)).toEqual(result.sequence.unitIds);
  });
});
