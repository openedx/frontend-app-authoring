import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import { IntlProvider } from '@edx/frontend-platform/i18n';

import Gallery from './Gallery';

jest.mock('../../data/redux', () => ({
  selectors: {
    requests: {
      isFinished: (state, { requestKey }) => ({ isFinished: { state, requestKey } }),
    },
  },
}));

jest.mock('./GalleryCard', () => 'GalleryCard');

describe('TextEditor Image Gallery component', () => {
  describe('component', () => {
    const props = {
      galleryIsEmpty: false,
      emptyGalleryLabel: {
        id: 'emptyGalleryMsg',
        defaultMessage: 'Empty Gallery',
      },
      searchIsEmpty: false,
      displayList: [{ id: 1 }, { id: 2 }, { id: 3 }],
      highlighted: 'props.highlighted',
      onHighlightChange: jest.fn().mockName('props.onHighlightChange'),
      isLoaded: true,
      fetchNextPage: null,
      assetCount: 0,
      allowLazyLoad: false,
    };
    const shallowWithIntl = (component) => shallow(<IntlProvider locale="en">{component}</IntlProvider>);
    test('snapshot: not loaded, show spinner', () => {
      expect(shallowWithIntl(<Gallery {...props} isLoaded={false} />).snapshot).toMatchSnapshot();
    });
    test('snapshot: loaded but no images, show empty gallery', () => {
      expect(shallowWithIntl(<Gallery {...props} galleryIsEmpty />).snapshot).toMatchSnapshot();
    });
    test('snapshot: loaded but search returns no images, show 0 search result gallery', () => {
      expect(shallowWithIntl(<Gallery {...props} searchIsEmpty />).snapshot).toMatchSnapshot();
    });
    test('snapshot: loaded, show gallery', () => {
      expect(shallowWithIntl(<Gallery {...props} />).snapshot).toMatchSnapshot();
    });
  });
});
