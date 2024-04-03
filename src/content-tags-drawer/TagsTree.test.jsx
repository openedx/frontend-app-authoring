import React, { useMemo } from 'react';
import {
  render, screen, within, fireEvent,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import TagsTree from './TagsTree';
import { contentTaxonomyTagsTreeMock } from './__mocks__';
import { ContentTagsDrawerContext } from './common/context';

const mockRemoveTagHandler = jest.fn();

const RootWrapper = (params) => {
  const context = useMemo(() => ({
    isEditMode: params.isEditMode,
  }), []);
  return (
    <ContentTagsDrawerContext.Provider value={context}>
      <IntlProvider locale="en" messages={{}}>
        <TagsTree {...params} />
      </IntlProvider>
    </ContentTagsDrawerContext.Provider>
  );
};

describe('<TagsTree>', () => {
  it('should render component and tags correctly', () => {
    render(<RootWrapper tags={contentTaxonomyTagsTreeMock} />);
    expect(screen.getByText('hierarchical taxonomy tag 1')).toBeInTheDocument();
    expect(screen.getByText('hierarchical taxonomy tag 2.13')).toBeInTheDocument();
    expect(screen.getByText('hierarchical taxonomy tag 3.4.50')).toBeInTheDocument();
  });

  it('should not show delete buttons on read mode', () => {
    render(
      <RootWrapper
        tags={contentTaxonomyTagsTreeMock}
      />,
    );
    expect(screen.queryByRole('button', {
      name: /delete/i,
    })).not.toBeInTheDocument();
  });

  it('should call removeTagHandler when "x" clicked on explicit tag', async () => {
    render(
      <RootWrapper
        tags={contentTaxonomyTagsTreeMock}
        removeTagHandler={mockRemoveTagHandler}
        isEditMode
      />,
    );

    const view = screen.getByText(/hierarchical taxonomy tag 1\.7\.59/i);
    const xButton = within(view).getByRole('button', {
      name: /delete/i,
    });
    fireEvent.click(xButton);
    expect(mockRemoveTagHandler).toHaveBeenCalled();
  });
});
