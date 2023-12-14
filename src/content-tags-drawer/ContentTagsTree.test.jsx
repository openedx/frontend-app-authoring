import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { act, render } from '@testing-library/react';
import PropTypes from 'prop-types';

import ContentTagsTree from './ContentTagsTree';

const data = {
  'Science and Research': {
    explicit: false,
    children: {
      'Genetics Subcategory': {
        explicit: false,
        children: {
          'DNA Sequencing': {
            explicit: true,
            children: {},
          },
        },
      },
      'Molecular, Cellular, and Microbiology': {
        explicit: false,
        children: {
          Virology: {
            explicit: true,
            children: {},
          },
        },
      },
    },
  },
};

const ContentTagsTreeComponent = ({ tagsTree, removeTagHandler, editable }) => (
  <IntlProvider locale="en" messages={{}}>
    <ContentTagsTree tagsTree={tagsTree} removeTagHandler={removeTagHandler} editable={editable} />
  </IntlProvider>
);

ContentTagsTreeComponent.propTypes = {
  tagsTree: PropTypes.objectOf(
    PropTypes.shape({
      explicit: PropTypes.bool.isRequired,
      children: PropTypes.shape({}).isRequired,
    }).isRequired,
  ).isRequired,
  removeTagHandler: PropTypes.func.isRequired,
  editable: PropTypes.bool.isRequired,
};

describe('<ContentTagsTree />', () => {
  it('should render taxonomy tags data along content tags number badge', async () => {
    await act(async () => {
      const { getByText } = render(<ContentTagsTreeComponent tagsTree={data} removeTagHandler={() => {}} editable />);
      expect(getByText('Science and Research')).toBeInTheDocument();
      expect(getByText('Genetics Subcategory')).toBeInTheDocument();
      expect(getByText('Molecular, Cellular, and Microbiology')).toBeInTheDocument();
      expect(getByText('DNA Sequencing')).toBeInTheDocument();
      expect(getByText('Virology')).toBeInTheDocument();
    });
  });
});
