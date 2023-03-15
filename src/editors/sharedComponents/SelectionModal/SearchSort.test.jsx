import React from 'react';
import { shallow } from 'enzyme';
import { Dropdown } from '@edx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { formatMessage } from '../../../testUtils';

import { sortKeys, sortMessages } from '../ImageUploadModal/SelectImageModal/utils';
import { SearchSort } from './SearchSort';

describe('SearchSort component', () => {
  const props = {
    searchString: 'props.searchString',
    onSearchChange: jest.fn().mockName('props.onSearchChange'),
    clearSearchString: jest.fn().mockName('props.clearSearchString'),
    sortBy: sortKeys.dateOldest,
    sortKeys,
    sortMessages,
    onSortClick: jest.fn().mockName('props.onSortClick'),
    intl: { formatMessage },
  };
  describe('snapshots', () => {
    test('with search string (close button)', () => {
      expect(shallow(<SearchSort {...props} />)).toMatchSnapshot();
    });
    test('without search string (search icon)', () => {
      expect(shallow(<SearchSort {...props} searchString="" />)).toMatchSnapshot();
    });
    test('adds a sort option for each sortKey', () => {
      const el = shallow(<SearchSort {...props} />);
      expect(el.find(Dropdown).containsMatchingElement(
        <FormattedMessage {...sortMessages.dateNewest} />,
      )).toEqual(true);
      expect(el.find(Dropdown).containsMatchingElement(
        <FormattedMessage {...sortMessages.dateOldest} />,
      )).toEqual(true);
      expect(el.find(Dropdown).containsMatchingElement(
        <FormattedMessage {...sortMessages.nameAscending} />,
      )).toEqual(true);
      expect(el.find(Dropdown).containsMatchingElement(
        <FormattedMessage {...sortMessages.nameDescending} />,
      )).toEqual(true);
    });
  });
});
