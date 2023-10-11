import Cookies from 'universal-cookie';

import { LAST_IMPORT_COOKIE_NAME } from './data/constants';
import { setImportCookie } from './utils';

global.window = Object.create(window);
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/some-path',
  },
});

describe('setImportCookie', () => {
  it('should set the import cookie with the provided data', () => {
    const cookiesSetMock = jest.spyOn(Cookies.prototype, 'set');
    const date = '2023-07-24';
    const completed = true;
    const fileName = 'testFileName.test';
    setImportCookie(date, completed, fileName);

    expect(cookiesSetMock).toHaveBeenCalledWith(
      LAST_IMPORT_COOKIE_NAME,
      { date, completed, fileName },
      { path: '/some-path' },
    );

    cookiesSetMock.mockRestore();
  });
});
