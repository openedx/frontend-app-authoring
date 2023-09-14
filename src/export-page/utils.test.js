import Cookies from 'universal-cookie';
import moment from 'moment';

import { LAST_EXPORT_COOKIE_NAME } from './data/constants';
import { setExportCookie, getFormattedSuccessDate } from './utils';

global.window = Object.create(window);
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/some-path',
  },
});

describe('setExportCookie', () => {
  it('should set the export cookie with the provided date and completed status', () => {
    const cookiesSetMock = jest.spyOn(Cookies.prototype, 'set');
    const date = '2023-07-24';
    const completed = true;
    setExportCookie(date, completed);

    expect(cookiesSetMock).toHaveBeenCalledWith(
      LAST_EXPORT_COOKIE_NAME,
      { date, completed },
      { path: '/some-path' },
    );

    cookiesSetMock.mockRestore();
  });
});

describe('getFormattedSuccessDate', () => {
  it('should return formatted success date with valid input', () => {
    const mockCurrentUtcDate = moment.utc('2023-07-24T12:34:56');
    const momentMock = jest.spyOn(moment, 'utc').mockReturnValue(mockCurrentUtcDate);

    const unixDate = 1679787000;

    const expectedFormattedDate = ' (01/20/1970 at 10:36 UTC)';

    const result = getFormattedSuccessDate(unixDate);
    expect(result).toBe(expectedFormattedDate);

    momentMock.mockRestore();
  });

  it('should return null with null input', () => {
    const unixDate = null;
    const result = getFormattedSuccessDate(unixDate);
    expect(result).toBeNull();
  });
});
