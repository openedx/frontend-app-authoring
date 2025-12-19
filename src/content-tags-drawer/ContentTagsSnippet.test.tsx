import {
  render, screen, waitFor, initializeMocks,
} from '@src/testUtils';

import { mockContentTaxonomyTagsData } from './data/api.mocks';
import { ContentTagsSnippet } from './ContentTagsSnippet';

mockContentTaxonomyTagsData.applyMock();

const {
  otherTagsId,
  largeTagsId,
  veryLongTagsId,
} = mockContentTaxonomyTagsData;

describe('<ContentTagsSnippet />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('should render the tags correctly', async () => {
    render(<ContentTagsSnippet contentId={otherTagsId} />);
    await waitFor(() => {
      expect(screen.getByText('Taxonomy 1 (2)')).toBeInTheDocument();
    });
    expect(screen.getByText('Tag 1')).toBeInTheDocument();
    expect(screen.getByText('Tag 2')).toBeInTheDocument();
    expect(screen.getByText('Taxonomy 2 (2)')).toBeInTheDocument();
    expect(screen.getByText('Tag 3')).toBeInTheDocument();
    expect(screen.getByText('Tag 4')).toBeInTheDocument();
  });

  it('should render the tags with lineage correctly', async () => {
    render(<ContentTagsSnippet contentId={largeTagsId} />);
    await waitFor(() => {
      expect(screen.getByText('Taxonomy 3 (1)')).toBeInTheDocument();
    });
    expect(screen.getByText('Tag 1 > Tag 1.1 > Tag 1.1.1')).toBeInTheDocument();
  });

  it('should render the very long lineage correctly', async () => {
    render(<ContentTagsSnippet contentId={veryLongTagsId} />);
    await waitFor(() => {
      expect(screen.getByText('ESDC Skills and Competencies (2)')).toBeInTheDocument();
    });

    // Skills > Technical Skills Sub-Category > Technical Skills
    // Can fit only first and last level
    expect(screen.getByText('Skills > .. > Technical Skills')).toBeInTheDocument();

    // Abilities > Cognitive Abilities > Communication Abilities
    // can fit only last level
    expect(screen.getByText('.. > Communication Abilities')).toBeInTheDocument();
  });
});
