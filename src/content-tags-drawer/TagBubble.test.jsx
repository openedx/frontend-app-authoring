import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import PropTypes from 'prop-types';

import TagBubble from './TagBubble';

const data = {
  value: 'Tag 1',
};

const TagBubbleComponent = ({ value, subTagsCount, implicit }) => (
  <IntlProvider locale="en" messages={{}}>
    <TagBubble value={value} subTagsCount={subTagsCount} implicit={implicit} />
  </IntlProvider>
);

TagBubbleComponent.defaultProps = {
  subTagsCount: 0,
  implicit: true,
};

TagBubbleComponent.propTypes = {
  value: PropTypes.string.isRequired,
  subTagsCount: PropTypes.number,
  implicit: PropTypes.bool,
};

describe('<TagBubble />', () => {
  it('should render only value of the implicit tag with no sub tags', () => {
    const { container, getByText } = render(<TagBubbleComponent value={data.value} />);
    expect(getByText(data.value)).toBeInTheDocument();
    expect(container.getElementsByClassName('implicit').length).toBe(1);
  });

  it('should render value of the implicit tag with sub tags', () => {
    const tagBubbleData = {
      subTagsCount: 5,
      ...data,
    };
    const { container, getByText } = render(
      <TagBubbleComponent
        value={tagBubbleData.value}
        subTagsCount={tagBubbleData.subTagsCount}
      />,
    );
    expect(getByText(`${tagBubbleData.value} (${tagBubbleData.subTagsCount})`)).toBeInTheDocument();
    expect(container.getElementsByClassName('implicit').length).toBe(1);
  });

  it('should render value of the explicit tag with no sub tags', () => {
    const tagBubbleData = {
      implicit: false,
      ...data,
    };
    const { container, getByText } = render(
      <TagBubbleComponent
        value={tagBubbleData.value}
        implicit={tagBubbleData.implicit}
      />,
    );
    expect(getByText(`${tagBubbleData.value}`)).toBeInTheDocument();
    expect(container.getElementsByClassName('implicit').length).toBe(0);
    expect(container.getElementsByClassName('btn-icon-after').length).toBe(1);
  });
});
