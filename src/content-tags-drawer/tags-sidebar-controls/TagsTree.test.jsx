import React from 'react';
import { render, screen } from '@testing-library/react';
import TagsTree from './TagsTree';
import { contentTaxonomyTagsTreeMock } from '../__mocks__';

describe('<TagsTree>', () => {
  it('should render component and tags correctly', () => {
    render(<TagsTree tags={contentTaxonomyTagsTreeMock} />);
    expect(screen.getByText('hierarchical taxonomy tag 1')).toBeInTheDocument();
    expect(screen.getByText('hierarchical taxonomy tag 2.13')).toBeInTheDocument();
    expect(screen.getByText('hierarchical taxonomy tag 3.4.50')).toBeInTheDocument();
  });
});
