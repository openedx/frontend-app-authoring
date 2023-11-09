import { initializeMockApp } from '@edx/frontend-platform';

import {
  getTaxonomyTemplateApiUrl,
  getTaxonomyTemplateFile,
} from './api';

describe('taxonomy api calls', () => {
  const { location } = window;
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    delete window.location;
    window.location = {
      href: '',
    };
  });

  afterAll(() => {
    window.location = location;
  });

  it('should set window.location.href correctly', () => {
    getTaxonomyTemplateFile('json');

    expect(window.location.href).toEqual(getTaxonomyTemplateApiUrl('json'));
  });
});
