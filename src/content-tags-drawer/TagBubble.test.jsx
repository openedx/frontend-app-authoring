import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, fireEvent } from '@testing-library/react';
import PropTypes from 'prop-types';

import TagBubble from './TagBubble';

const data = {
  value: 'Tag 1',
  lineage: [],
  removeTagHandler: jest.fn(),
};

const TagBubbleComponent = ({
  value, implicit, level, lineage, removeTagHandler, canDelete,
}) => (
  <IntlProvider locale="en" messages={{}}>
    <TagBubble
      value={value}
      implicit={implicit}
      level={level}
      lineage={lineage}
      removeTagHandler={removeTagHandler}
      canDelete={canDelete}
    />
  </IntlProvider>
);

TagBubbleComponent.defaultProps = {
  implicit: true,
  level: 0,
};

TagBubbleComponent.propTypes = {
  value: PropTypes.string.isRequired,
  implicit: PropTypes.bool,
  level: PropTypes.number,
  lineage: PropTypes.arrayOf(PropTypes.string).isRequired,
  removeTagHandler: PropTypes.func.isRequired,
  canDelete: PropTypes.bool.isRequired,
};

describe('<TagBubble />', () => {
  it('should render implicit tag', () => {
    const { container, getByText } = render(
      <TagBubbleComponent
        value={data.value}
        canDelete
        lineage={data.lineage}
        removeTagHandler={data.removeTagHandler}
      />,
    );
    expect(getByText(data.value)).toBeInTheDocument();
    expect(container.getElementsByClassName('implicit').length).toBe(1);
    expect(container.getElementsByClassName('pgn__chip__icon-after').length).toBe(0);
  });

  it('should render explicit tag', () => {
    const tagBubbleData = {
      implicit: false,
      ...data,
    };
    const { container, getByText } = render(
      <TagBubbleComponent
        value={tagBubbleData.value}
        canDelete
        lineage={data.lineage}
        implicit={tagBubbleData.implicit}
        removeTagHandler={tagBubbleData.removeTagHandler}
      />,
    );
    expect(getByText(`${tagBubbleData.value}`)).toBeInTheDocument();
    expect(container.getElementsByClassName('implicit').length).toBe(0);
    expect(container.getElementsByClassName('pgn__chip__icon-after').length).toBe(1);
  });

  it('should call removeTagHandler when "x" clicked on explicit tag', async () => {
    const tagBubbleData = {
      implicit: false,
      ...data,
    };
    const { container } = render(
      <TagBubbleComponent
        value={tagBubbleData.value}
        canDelete
        lineage={data.lineage}
        implicit={tagBubbleData.implicit}
        removeTagHandler={tagBubbleData.removeTagHandler}
      />,
    );

    const xButton = container.getElementsByClassName('pgn__chip__icon-after')[0];
    fireEvent.click(xButton);
    expect(data.removeTagHandler).toHaveBeenCalled();
  });
});
