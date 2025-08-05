import React from 'react';
import { screen } from '@testing-library/react';
import { initializeMocks } from '@src/testUtils';
import editorRender from '../../../../../../editorTestRender';
import LicenseWidget from '.';

describe('LicenseWidget', () => {
  const baseState = {
    app: {
      learningContextId: 'random-id', // not a library ID, so isLibrary returns false
      blockId: null,
    },
    video: {
      licenseType: '',
      licenseDetails: {},
      courseLicenseType: 'all-rights-reserved',
      courseLicenseDetails: {},
    },
    requests: {},
  };
  beforeEach(() => {
    initializeMocks({ initialState: baseState });
  });

  test('renders as expected with default props (no license)', () => {
    editorRender(<LicenseWidget />, { initialState: baseState });

    expect(screen.getByText('License')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add a license for this video' }),
    ).toBeInTheDocument();
  });

  test('renders without add button when isLibrary is true', () => {
    const isLibraryState = {
      ...baseState,
      app: {
        ...baseState.app,
        learningContextId: 'library-v1:abc123', // will trigger isLibrary selector
      },
      video: {
        ...baseState.video,
        licenseType: 'all-rights-reserved',
      },
    };

    editorRender(<LicenseWidget />, { initialState: isLibraryState });

    expect(screen.getByText('License')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add a license for this video' }),
    ).not.toBeInTheDocument();
  });

  test('renders as expected when licenseType is defined', () => {
    const licenseTypeState = {
      ...baseState,
      video: {
        ...baseState.video,
        licenseType: 'all-rights-reserved',
      },
    };

    editorRender(<LicenseWidget />, { initialState: licenseTypeState });

    expect(screen.getByText('License')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add a license for this video' }),
    ).not.toBeInTheDocument();
  });
});
