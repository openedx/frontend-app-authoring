/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/jsx-filename-extension */
import {
  fireEvent, render, waitFor, screen, act,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';
import PropTypes from 'prop-types';

import initializeStore from '../../store';
import ScanResults from './ScanResults';
import messages from './messages';
import { useWaffleFlags } from '../../data/apiHooks';
import * as thunks from '../data/thunks';

const mockLinkCheckResult = {
  sections: [
    {
      id: 'section-1',
      displayName: 'Introduction to Programming',
      subsections: [
        {
          id: 'subsection-1-1',
          displayName: 'Getting Started',
          units: [
            {
              id: 'unit-1-1-1',
              displayName: 'Test Broken Links',
              blocks: [
                {
                  id: 'block-1-1-1-5',
                  url: 'https://example.com/welcome-video',
                  brokenLinks: ['https://example.com/broken-link'],
                  lockedLinks: [],
                  externalForbiddenLinks: [],
                  previousRunLinks: [],
                },
              ],
            },
            {
              id: 'unit-1-1-2',
              displayName: 'Test Locked Links',
              blocks: [
                {
                  id: 'block-1-1-2-1',
                  url: 'https://example.com/course-overview',
                  brokenLinks: [],
                  lockedLinks: ['https://example.com/locked-link'],
                  externalForbiddenLinks: [],
                  previousRunLinks: [],
                },
              ],
            },
            {
              id: 'unit-1-1-3',
              displayName: 'Test Manual Links',
              blocks: [
                {
                  id: 'block-1-1-1-1',
                  url: 'https://example.com/welcome-video',
                  brokenLinks: [],
                  lockedLinks: [],
                  externalForbiddenLinks: ['https://outsider.com/forbidden-link'],
                  previousRunLinks: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  courseUpdates: [
    {
      id: 'course-update-1',
      displayName: 'Course Update 1',
      url: 'https://example.com/course-update-1',
      brokenLinks: ['https://example.com/broken-course-update-link'],
      lockedLinks: [],
      externalForbiddenLinks: [],
      previousRunLinks: [],
    },
  ],
  customPages: [
    {
      id: 'custom-page-1',
      displayName: 'Custom Page 1',
      url: 'https://example.com/custom-page-1',
      brokenLinks: [],
      lockedLinks: [],
      externalForbiddenLinks: ['https://example.com/forbidden-custom-page-link'],
      previousRunLinks: [],
    },
  ],
};

const mockLinkCheckResultWithPrevious = {
  ...mockLinkCheckResult,
  courseUpdates: [
    {
      id: 'course-update-with-prev-links',
      displayName: 'Course Update with Previous Links',
      url: 'https://example.com/course-update',
      brokenLinks: [],
      lockedLinks: [],
      externalForbiddenLinks: [],
      previousRunLinks: [
        {
          originalLink: 'https://previous.run/link1',
          isUpdated: false,
        },
        {
          originalLink: 'https://previous.run/link2',
          isUpdated: true,
          updatedLink: 'https://previous.run/updated-link2',
        },
      ],
    },
  ],
};

const mockEmptyData = {
  sections: [
    {
      id: 'empty-section',
      displayName: 'Empty Section',
      subsections: [
        {
          id: 'empty-subsection',
          displayName: 'Empty Subsection',
          units: [
            {
              id: 'empty-unit',
              displayName: 'Empty Unit',
              blocks: [
                {
                  id: 'empty-block',
                  url: 'https://example.com/empty',
                  brokenLinks: [],
                  lockedLinks: [],
                  externalForbiddenLinks: [],
                  previousRunLinks: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  courseUpdates: [],
  customPages: [],
};

let store;
let axiosMock;
const courseId = 'test-course-id';

// Mock the waffle flags hook
jest.mock('../../data/apiHooks', () => ({
  useWaffleFlags: jest.fn(() => ({
    enableCourseOptimizerCheckPrevRunLinks: false,
  })),
}));

// Mock the thunks
jest.mock('../data/thunks', () => ({
  updateSinglePreviousRunLink: jest.fn(() => () => Promise.resolve({ status: 'Succeeded' })),
  updateAllPreviousRunLinks: jest.fn(() => () => Promise.resolve({ status: 'Succeeded' })),
  fetchRerunLinkUpdateStatus: jest.fn(() => () => Promise.resolve({
    status: 'Succeeded',
    results: [{ id: 'course-update-with-prev-links', success: true }],
  })),
  fetchLinkCheckStatus: jest.fn(() => () => Promise.resolve({})),
}));

const ScanResultsWrapper = ({ data = mockLinkCheckResult, onErrorStateChange = jest.fn() }) => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <ScanResults data={data} courseId={courseId} onErrorStateChange={onErrorStateChange} />
    </IntlProvider>
  </AppProvider>
);

ScanResultsWrapper.propTypes = {
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.oneOf([null])]),
  onErrorStateChange: PropTypes.func,
};

describe('ScanResults', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  afterEach(() => {
    axiosMock.restore();
  });

  describe('Basic Rendering', () => {
    it('should render broken links header and filter button', () => {
      render(<ScanResultsWrapper />);

      expect(screen.getByText(messages.brokenLinksHeader.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(messages.filterButtonLabel.defaultMessage)).toBeInTheDocument();
    });

    it('should render no data card when data is null', () => {
      render(<ScanResultsWrapper data={null} />);

      expect(screen.getByText(messages.noDataCard.defaultMessage)).toBeInTheDocument();
    });

    it('should render no data card when no links are present', () => {
      render(<ScanResultsWrapper data={mockEmptyData} />);

      expect(screen.getByText(messages.noDataCard.defaultMessage)).toBeInTheDocument();
    });

    it('should render sections with broken links', () => {
      render(<ScanResultsWrapper />);

      expect(screen.getByText('Introduction to Programming')).toBeInTheDocument();
    });

    it('should render course updates section when present', () => {
      render(<ScanResultsWrapper />);

      expect(screen.getByText(messages.courseUpdatesHeader.defaultMessage)).toBeInTheDocument();
    });

    it('should render custom pages section when present', () => {
      render(<ScanResultsWrapper />);

      expect(screen.getByText(messages.customPagesHeader.defaultMessage)).toBeInTheDocument();
    });
  });

  describe('Filter Functionality', () => {
    it('should open filter modal when filter button is clicked', async () => {
      render(<ScanResultsWrapper />);

      const filterButton = screen.getByText(messages.filterButtonLabel.defaultMessage);
      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText(messages.brokenLabel.defaultMessage)).toBeInTheDocument();
        expect(screen.getByText(messages.lockedLabel.defaultMessage)).toBeInTheDocument();
        expect(screen.getByText(messages.manualLabel.defaultMessage)).toBeInTheDocument();
      });
    });

    it('should show filter chips when filters are applied', async () => {
      render(<ScanResultsWrapper />);

      const filterButton = screen.getByText(messages.filterButtonLabel.defaultMessage);
      fireEvent.click(filterButton);

      await waitFor(() => {
        const brokenFilter = screen.getByLabelText(messages.brokenLabel.defaultMessage);
        fireEvent.click(brokenFilter);
      });

      expect(screen.getByTestId('chip-brokenLinks')).toBeInTheDocument();
    });

    it('should show clear filters button when filters are active', async () => {
      render(<ScanResultsWrapper />);

      const filterButton = screen.getByText(messages.filterButtonLabel.defaultMessage);
      fireEvent.click(filterButton);

      await waitFor(() => {
        const brokenFilter = screen.getByLabelText(messages.brokenLabel.defaultMessage);
        fireEvent.click(brokenFilter);
      });

      expect(screen.getByText(messages.clearFilters.defaultMessage)).toBeInTheDocument();
    });

    it('should remove filter when chip is clicked', async () => {
      render(<ScanResultsWrapper />);

      const filterButton = screen.getByText(messages.filterButtonLabel.defaultMessage);
      fireEvent.click(filterButton);

      await waitFor(() => {
        const brokenFilter = screen.getByLabelText(messages.brokenLabel.defaultMessage);
        fireEvent.click(brokenFilter);
      });

      const chip = screen.getByTestId('chip-brokenLinks');
      fireEvent.click(chip);

      expect(screen.queryByTestId('chip-brokenLinks')).not.toBeInTheDocument();
    });

    it('should clear all filters when clear filters button is clicked', async () => {
      render(<ScanResultsWrapper />);

      const filterButton = screen.getByText(messages.filterButtonLabel.defaultMessage);
      fireEvent.click(filterButton);

      await waitFor(() => {
        fireEvent.click(screen.getByLabelText(messages.brokenLabel.defaultMessage));
        fireEvent.click(screen.getByLabelText(messages.lockedLabel.defaultMessage));
      });

      const clearButton = screen.getByText(messages.clearFilters.defaultMessage);
      fireEvent.click(clearButton);

      expect(screen.queryByTestId('chip-brokenLinks')).not.toBeInTheDocument();
      expect(screen.queryByTestId('chip-lockedLinks')).not.toBeInTheDocument();
    });
  });

  describe('Section Collapsible Functionality', () => {
    it('should toggle section open/close state', () => {
      render(<ScanResultsWrapper />);

      const collapsibleTrigger = screen.getAllByText('Introduction to Programming')[0];
      fireEvent.click(collapsibleTrigger);

      // Section should be expanded and show unit content
      expect(screen.getByText('https://example.com/broken-link')).toBeInTheDocument();
    });
  });

  describe('Previous Run Links Feature', () => {
    beforeEach(() => {
      // Enable the waffle flag for previous run links
      useWaffleFlags.mockReturnValue({
        enableCourseOptimizerCheckPrevRunLinks: true,
      });
    });

    afterEach(() => {
      useWaffleFlags.mockReturnValue({
        enableCourseOptimizerCheckPrevRunLinks: false,
      });
    });

    it('should show previous run links section when flag is enabled and links exist', () => {
      render(<ScanResultsWrapper data={mockLinkCheckResultWithPrevious} />);

      expect(screen.getByText(messages.linkToPrevCourseRun.defaultMessage)).toBeInTheDocument();
    });

    it('should show update all button for previous run links', () => {
      render(<ScanResultsWrapper data={mockLinkCheckResultWithPrevious} />);

      expect(screen.getByTestId('update-all-course')).toBeInTheDocument();
    });

    it('should not show previous run links section when flag is disabled', () => {
      // Disable the flag
      useWaffleFlags.mockReturnValue({
        enableCourseOptimizerCheckPrevRunLinks: false,
      });

      render(<ScanResultsWrapper data={mockLinkCheckResultWithPrevious} />);

      expect(screen.queryByText(messages.linkToPrevCourseRun.defaultMessage)).not.toBeInTheDocument();
    });
  });

  describe('Update Link Functionality', () => {
    beforeEach(() => {
      useWaffleFlags.mockReturnValue({
        enableCourseOptimizerCheckPrevRunLinks: true,
      });
    });

    it('should handle successful single link update', async () => {
      const mockOnErrorStateChange = jest.fn();

      thunks.updateSinglePreviousRunLink.mockReturnValue(() => Promise.resolve({ status: 'Succeeded' }));
      thunks.fetchRerunLinkUpdateStatus.mockReturnValue(() => Promise.resolve({
        status: 'Succeeded',
        results: [{ id: 'course-update-with-prev-links', success: true }],
      }));

      render(<ScanResultsWrapper data={mockLinkCheckResultWithPrevious} onErrorStateChange={mockOnErrorStateChange} />);

      const collapsibleTrigger = screen.getByText('Course updates');
      fireEvent.click(collapsibleTrigger);

      await waitFor(() => {
        const updateButton = screen.getByText('Update');
        fireEvent.click(updateButton);
      });

      // Should clear error state on success
      await waitFor(() => {
        expect(mockOnErrorStateChange).toHaveBeenCalledWith(null);
      });
    });

    it('should handle failed single link update', async () => {
      const mockOnErrorStateChange = jest.fn();

      // Mock failed response - the thunk should still resolve but with failed status
      thunks.updateSinglePreviousRunLink.mockReturnValue(() => Promise.resolve({ status: 'Succeeded' }));
      thunks.fetchRerunLinkUpdateStatus.mockReturnValue(() => Promise.resolve({
        status: 'Succeeded',
        results: [{ id: 'course-update-with-prev-links', success: false }], // success: false indicates failure
      }));

      render(<ScanResultsWrapper data={mockLinkCheckResultWithPrevious} onErrorStateChange={mockOnErrorStateChange} />);

      const collapsibleTrigger = screen.getByText('Course updates');
      fireEvent.click(collapsibleTrigger);

      await waitFor(() => {
        const updateButton = screen.getByText('Update');
        fireEvent.click(updateButton);
      });

      await waitFor(() => {
        expect(mockOnErrorStateChange).toHaveBeenCalledWith(messages.updateLinkError.defaultMessage);
      });
    });

    it('should handle update all links success', async () => {
      const mockOnErrorStateChange = jest.fn();

      thunks.updateAllPreviousRunLinks.mockReturnValue(() => Promise.resolve({ status: 'Succeeded' }));
      thunks.fetchRerunLinkUpdateStatus.mockReturnValue(() => Promise.resolve({
        status: 'Succeeded',
        results: [{ id: 'course-update-with-prev-links', success: true }],
      }));

      render(<ScanResultsWrapper data={mockLinkCheckResultWithPrevious} onErrorStateChange={mockOnErrorStateChange} />);

      const updateAllButton = screen.getByTestId('update-all-course');

      await act(async () => {
        fireEvent.click(updateAllButton);
      });

      // Should clear error state on success
      await waitFor(() => {
        expect(mockOnErrorStateChange).toHaveBeenCalledWith(null);
      });
    });

    it('should handle update all links partial failure', async () => {
      const mockOnErrorStateChange = jest.fn();

      // Mock partial failure response
      thunks.updateAllPreviousRunLinks.mockReturnValue(() => Promise.resolve({ status: 'Succeeded' }));
      thunks.fetchRerunLinkUpdateStatus.mockReturnValue(() => Promise.resolve({
        status: 'Succeeded',
        results: [
          { id: 'block-1', success: true },
          { id: 'block-2', success: false },
        ],
      }));

      render(<ScanResultsWrapper data={mockLinkCheckResultWithPrevious} onErrorStateChange={mockOnErrorStateChange} />);

      const updateAllButton = screen.getByTestId('update-all-course');

      await act(async () => {
        fireEvent.click(updateAllButton);
      });

      await waitFor(() => {
        expect(mockOnErrorStateChange).toHaveBeenCalledWith(messages.updateLinksError.defaultMessage);
      });
    });

    it('should disable update all button when all links are updated', () => {
      const dataWithAllUpdated = {
        ...mockLinkCheckResultWithPrevious,
        courseUpdates: [
          {
            id: 'course-update-with-all-updated',
            displayName: 'Course Update with All Updated Links',
            brokenLinks: [],
            lockedLinks: [],
            externalForbiddenLinks: [],
            previousRunLinks: [
              {
                originalLink: 'https://previous.run/link1',
                isUpdated: true,
                updatedLink: 'https://updated.run/link1',
              },
              {
                originalLink: 'https://previous.run/link2',
                isUpdated: true,
                updatedLink: 'https://updated.run/link2',
              },
            ],
          },
        ],
        customPages: [],
        sections: mockLinkCheckResultWithPrevious.sections,
      };

      render(<ScanResultsWrapper data={dataWithAllUpdated} />);

      const updateAllButton = screen.getByTestId('update-all-course');
      expect(updateAllButton).toBeDisabled();
    });
  });

  describe('Content Type Detection', () => {
    it('should detect course updates content type', () => {
      render(<ScanResultsWrapper />);
      expect(screen.getByText(messages.courseUpdatesHeader.defaultMessage)).toBeInTheDocument();
    });

    it('should detect custom pages content type', () => {
      render(<ScanResultsWrapper />);
      expect(screen.getByText(messages.customPagesHeader.defaultMessage)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle exceptions in single link update', async () => {
      const mockOnErrorStateChange = jest.fn();

      thunks.updateSinglePreviousRunLink.mockReturnValue(() => {
        throw new Error('Network error');
      });

      render(<ScanResultsWrapper data={mockLinkCheckResultWithPrevious} onErrorStateChange={mockOnErrorStateChange} />);

      const collapsibleTrigger = screen.getByText('Course updates');
      fireEvent.click(collapsibleTrigger);

      await waitFor(() => {
        const updateButton = screen.getByText('Update');
        fireEvent.click(updateButton);
      });

      // Should show error message
      await waitFor(() => {
        expect(mockOnErrorStateChange).toHaveBeenCalledWith(messages.updateLinkError.defaultMessage);
      });
    });

    it('should handle exceptions in update all links', async () => {
      const mockOnErrorStateChange = jest.fn();

      thunks.updateAllPreviousRunLinks.mockReturnValue(() => {
        throw new Error('Network error');
      });

      render(<ScanResultsWrapper data={mockLinkCheckResultWithPrevious} onErrorStateChange={mockOnErrorStateChange} />);

      const updateAllButton = screen.getByTestId('update-all-course');

      await act(async () => {
        fireEvent.click(updateAllButton);
      });

      // Should show error message
      await waitFor(() => {
        expect(mockOnErrorStateChange).toHaveBeenCalledWith(messages.updateLinksError.defaultMessage);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle sections with no visible units after filtering', async () => {
      const dataWithOnlyPrevious = {
        sections: [
          {
            id: 'section-1',
            displayName: 'Section with only previous run links',
            subsections: [
              {
                id: 'subsection-1',
                displayName: 'Subsection 1',
                units: [
                  {
                    id: 'unit-1',
                    displayName: 'Unit 1',
                    blocks: [
                      {
                        id: 'block-1',
                        url: 'https://example.com/unit',
                        brokenLinks: [],
                        lockedLinks: [],
                        externalForbiddenLinks: [],
                        previousRunLinks: [{ originalLink: 'https://prev.run/link', isUpdated: false }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        courseUpdates: [],
        customPages: [],
      };

      render(<ScanResultsWrapper data={dataWithOnlyPrevious} />);
      expect(screen.getByText(messages.noResultsFound.defaultMessage)).toBeInTheDocument();
    });

    it('should handle empty course updates and custom pages arrays', () => {
      const dataWithEmptyArrays = {
        sections: mockLinkCheckResult.sections,
        courseUpdates: [],
        customPages: [],
      };

      render(<ScanResultsWrapper data={dataWithEmptyArrays} />);
      expect(screen.getByText('Introduction to Programming')).toBeInTheDocument();
      // Should not render course updates or custom pages headers
      expect(screen.queryByText(messages.courseUpdatesHeader.defaultMessage)).not.toBeInTheDocument();
      expect(screen.queryByText(messages.customPagesHeader.defaultMessage)).not.toBeInTheDocument();
    });
  });

  // Add more comprehensive edge case tests
  describe('ScanResults Advanced Edge Cases', () => {
    beforeEach(() => {
      useWaffleFlags.mockReturnValue({
        enableCourseOptimizerCheckPrevRunLinks: true,
      });
    });

    it('should handle mixed data with some empty arrays', () => {
      const mixedData = {
        sections: [
          {
            id: 'section-with-no-links',
            displayName: 'Section with No Links',
            subsections: [
              {
                id: 'subsection-1',
                displayName: 'Subsection 1',
                units: [
                  {
                    id: 'unit-1',
                    displayName: 'Unit 1',
                    blocks: [
                      {
                        id: 'block-1',
                        url: 'https://example.com/unit',
                        brokenLinks: [],
                        lockedLinks: [],
                        externalForbiddenLinks: [],
                        previousRunLinks: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        courseUpdates: [
          {
            id: 'empty-course-update',
            displayName: 'Empty Course Update',
            url: 'https://example.com/course-update',
            brokenLinks: [],
            lockedLinks: [],
            externalForbiddenLinks: [],
            previousRunLinks: [],
          },
        ],
        customPages: [],
      };

      render(<ScanResultsWrapper data={mixedData} />);

      // Should show "No Scan data available" since all link arrays are empty
      expect(screen.getByText(messages.noDataCard.defaultMessage)).toBeInTheDocument();
    });

    it('should handle data with null sections', () => {
      const nullSectionsData = {
        sections: null,
        courseUpdates: [],
        customPages: [],
      };

      expect(() => {
        render(<ScanResultsWrapper data={nullSectionsData} />);
      }).not.toThrow();
    });

    it('should handle data with undefined properties', () => {
      const undefinedPropsData = {
        sections: undefined,
        courseUpdates: undefined,
        customPages: undefined,
      };

      expect(() => {
        render(<ScanResultsWrapper data={undefinedPropsData} />);
      }).not.toThrow();
    });

    it('should handle mixed data with some content and some empty arrays', () => {
      const mixedData = {
        sections: [],
        courseUpdates: [
          {
            id: 'course-update-1',
            displayName: 'Course Update 1',
            url: 'https://example.com/course-update',
            brokenLinks: ['https://broken.example.com'],
            lockedLinks: [],
            externalForbiddenLinks: [],
            previousRunLinks: [],
          },
        ],
        customPages: [],
      };

      render(<ScanResultsWrapper data={mixedData} />);

      expect(screen.getByText(messages.courseUpdatesHeader.defaultMessage)).toBeInTheDocument();
    });

    it('should handle data with no previous run links when flag is enabled', () => {
      const dataWithoutPrevLinks = {
        sections: [
          {
            id: 'section-1',
            displayName: 'Section 1',
            subsections: [
              {
                id: 'subsection-1',
                displayName: 'Subsection 1',
                units: [
                  {
                    id: 'unit-1',
                    displayName: 'Unit 1',
                    blocks: [
                      {
                        id: 'block-1',
                        url: 'https://example.com/unit',
                        brokenLinks: ['https://broken.link'],
                        lockedLinks: [],
                        externalForbiddenLinks: [],
                        previousRunLinks: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        courseUpdates: [],
        customPages: [],
      };

      render(<ScanResultsWrapper data={dataWithoutPrevLinks} />);

      expect(screen.getByText(messages.brokenLinksHeader.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(messages.linkToPrevCourseRun.defaultMessage)).toBeInTheDocument();
      expect(screen.getAllByText(messages.noResultsFound.defaultMessage)).toHaveLength(1);
    });

    it('should handle complex nested structure with empty units', () => {
      const complexEmptyData = {
        sections: [
          {
            id: 'section-1',
            displayName: 'Section 1',
            subsections: [
              {
                id: 'subsection-1',
                displayName: 'Subsection 1',
                units: [], // Empty units array
              },
              {
                id: 'subsection-2',
                displayName: 'Subsection 2',
                units: [
                  {
                    id: 'unit-1',
                    displayName: 'Unit 1',
                    blocks: [], // Empty blocks array
                  },
                ],
              },
            ],
          },
        ],
        courseUpdates: [],
        customPages: [],
      };

      render(<ScanResultsWrapper data={complexEmptyData} />);

      // Since the data has no actual links, it should show "No Scan data available"
      expect(screen.getByText(messages.noDataCard.defaultMessage)).toBeInTheDocument();
    });

    it('should handle onErrorStateChange prop not provided', () => {
      expect(() => {
        render(<ScanResultsWrapper data={mockLinkCheckResultWithPrevious} onErrorStateChange={undefined} />);
      }).not.toThrow();
    });

    it('should handle sections with mixed link types', () => {
      const mixedLinksData = {
        sections: [
          {
            id: 'section-1',
            displayName: 'Section 1',
            subsections: [
              {
                id: 'subsection-1',
                displayName: 'Subsection 1',
                units: [
                  {
                    id: 'unit-1',
                    displayName: 'Unit 1',
                    blocks: [
                      {
                        id: 'block-1',
                        url: 'https://example.com/unit1',
                        brokenLinks: ['https://broken1.com'],
                        lockedLinks: ['https://locked1.com'],
                        externalForbiddenLinks: ['https://forbidden1.com'],
                        previousRunLinks: [{ originalLink: 'https://prev1.com', isUpdated: false }],
                      },
                      {
                        id: 'block-2',
                        url: 'https://example.com/unit2',
                        brokenLinks: [],
                        lockedLinks: ['https://locked2.com'],
                        externalForbiddenLinks: [],
                        previousRunLinks: [{ originalLink: 'https://prev2.com', isUpdated: true, updatedLink: 'https://updated2.com' }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        courseUpdates: [],
        customPages: [],
      };

      render(<ScanResultsWrapper data={mixedLinksData} />);

      const sectionElements = screen.getAllByText('Section 1');
      expect(sectionElements).toHaveLength(2);
    });

    it('should handle getContentType for unknown section types', () => {
      const unknownSectionData = {
        sections: [
          {
            id: 'section-1',
            displayName: 'Section with Links',
            subsections: [
              {
                id: 'subsection-1',
                displayName: 'Subsection 1',
                units: [
                  {
                    id: 'unit-1',
                    displayName: 'Unit 1',
                    blocks: [
                      {
                        id: 'block-1',
                        url: 'https://example.com/unit',
                        brokenLinks: ['https://broken.example.com'],
                        lockedLinks: [],
                        externalForbiddenLinks: [],
                        previousRunLinks: [{ originalLink: 'https://prev.com', isUpdated: false }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        courseUpdates: [],
        customPages: [],
        unknownSection: [
          {
            id: 'unknown-1',
            displayName: 'Unknown Section',
            brokenLinks: [],
            lockedLinks: [],
            externalForbiddenLinks: [],
            previousRunLinks: [{ originalLink: 'https://prev.com', isUpdated: false }],
          },
        ],
      };

      render(<ScanResultsWrapper data={unknownSectionData} />);

      // Should render without errors even with unknown section types
      expect(screen.getByText(messages.brokenLinksHeader.defaultMessage)).toBeInTheDocument();
    });
  });

  describe('ScanResults Filtering Integration', () => {
    beforeEach(() => {
      useWaffleFlags.mockReturnValue({
        enableCourseOptimizerCheckPrevRunLinks: true,
      });
    });

    it('should handle filtering with all link types present', () => {
      const fullData = {
        sections: [
          {
            id: 'section-1',
            displayName: 'Complete Section',
            subsections: [
              {
                id: 'subsection-1',
                displayName: 'Complete Subsection',
                units: [
                  {
                    id: 'unit-1',
                    displayName: 'Complete Unit',
                    blocks: [
                      {
                        id: 'block-1',
                        url: 'https://example.com/complete',
                        brokenLinks: ['https://broken.example.com'],
                        lockedLinks: ['https://locked.example.com'],
                        externalForbiddenLinks: ['https://forbidden.example.com'],
                        previousRunLinks: [{ link: 'https://previous.example.com', isUpdated: false }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        courseUpdates: [],
        customPages: [],
      };

      render(<ScanResultsWrapper data={fullData} />);

      expect(screen.getByText(messages.filterButtonLabel.defaultMessage)).toBeInTheDocument();

      fireEvent.click(screen.getByText(messages.filterButtonLabel.defaultMessage));

      expect(screen.getByText(messages.brokenLabel.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(messages.lockedLabel.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(messages.manualLabel.defaultMessage)).toBeInTheDocument();
    });

    it('should handle sections that become empty after filtering', () => {
      const dataForFiltering = {
        sections: [
          {
            id: 'section-only-broken',
            displayName: 'Section With Only Broken Links',
            subsections: [
              {
                id: 'subsection-1',
                displayName: 'Subsection 1',
                units: [
                  {
                    id: 'unit-1',
                    displayName: 'Unit 1',
                    blocks: [
                      {
                        id: 'block-1',
                        url: 'https://example.com/unit',
                        brokenLinks: ['https://broken.example.com'],
                        lockedLinks: [],
                        externalForbiddenLinks: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        courseUpdates: [],
        customPages: [],
      };

      render(<ScanResultsWrapper data={dataForFiltering} />);

      expect(screen.getByText('Section With Only Broken Links')).toBeInTheDocument();
    });
  });
});
