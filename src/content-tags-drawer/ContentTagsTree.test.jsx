import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { act, render } from '@testing-library/react';
import PropTypes from 'prop-types';

import ContentTagsTree from './ContentTagsTree';

const data = [
  {
    value: 'DNA Sequencing',
    lineage: [
      'Science and Research',
      'Genetics Subcategory',
      'DNA Sequencing',
    ],
  },
  {
    value: 'Virology',
    lineage: [
      'Science and Research',
      'Molecular, Cellular, and Microbiology',
      'Virology',
    ],
  },
];

const ContentTagsTreeComponent = ({ appliedContentTags }) => (
  <IntlProvider locale="en" messages={{}}>
    <ContentTagsTree appliedContentTags={appliedContentTags} />
  </IntlProvider>
);

ContentTagsTreeComponent.propTypes = {
  appliedContentTags: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string,
    lineage: PropTypes.arrayOf(PropTypes.string),
  })).isRequired,
};

describe('<ContentTagsTree />', () => {
  it('should render taxonomy tags data along content tags number badge', async () => {
    await act(async () => {
      const { getByText } = render(<ContentTagsTreeComponent appliedContentTags={data} />);
      expect(getByText('Science and Research')).toBeInTheDocument();
      expect(getByText('Genetics Subcategory')).toBeInTheDocument();
      expect(getByText('Molecular, Cellular, and Microbiology')).toBeInTheDocument();
      expect(getByText('DNA Sequencing')).toBeInTheDocument();
      expect(getByText('Virology')).toBeInTheDocument();
    });
  });
});
