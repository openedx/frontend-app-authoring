import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { act, render } from '@testing-library/react';

import ContentTagsTree from './ContentTagsTree';

const data = {
  'Science and Research': {
    explicit: false,
    canDeleteObjecttag: false,
    children: {
      'Genetics Subcategory': {
        explicit: false,
        children: {
          'DNA Sequencing': {
            explicit: true,
            children: {},
            canDeleteObjecttag: true,
          },
        },
        canDeleteObjecttag: false,
      },
      'Molecular, Cellular, and Microbiology': {
        explicit: false,
        children: {
          Virology: {
            explicit: true,
            children: {},
            canDeleteObjecttag: true,
          },
        },
        canDeleteObjecttag: false,
      },
    },
  },
};

const ContentTagsTreeComponent = ({ tagsTree, removeTagHandler }) => (
  <IntlProvider locale="en" messages={{}}>
    <ContentTagsTree tagsTree={tagsTree} removeTagHandler={removeTagHandler} />
  </IntlProvider>
);

ContentTagsTreeComponent.propTypes = ContentTagsTree.propTypes;

describe('<ContentTagsTree />', () => {
  it('should render taxonomy tags data along content tags number badge', async () => {
    await act(async () => {
      const { getByText } = render(<ContentTagsTreeComponent tagsTree={data} removeTagHandler={() => {}} />);
      expect(getByText('Science and Research')).toBeInTheDocument();
      expect(getByText('Genetics Subcategory')).toBeInTheDocument();
      expect(getByText('Molecular, Cellular, and Microbiology')).toBeInTheDocument();
      expect(getByText('DNA Sequencing')).toBeInTheDocument();
      expect(getByText('Virology')).toBeInTheDocument();
    });
  });
});
