import React from 'react';
import {
  fireEvent, screen, initializeMocks,
} from '@src/testUtils';
import * as redux from 'react-redux';
import editorRender from '../../../../../../editorTestRender';
import { LicenseSelectorInternal } from './LicenseSelector';
import * as hooks from './hooks';
import { actions } from '../../../../../../data/redux';

jest.mock('./hooks', () => ({
  determineText: jest.fn(() => ({ levelDescription: 'Test level description' })),
  onSelectLicense: jest.fn(() => jest.fn()),
}));

const LicenseTypes = {
  select: 'select',
  allRightsReserved: 'All Rights Reserved',
  creativeCommons: 'Creative Commons',
};
const LicenseLevel = { course: 'course', video: 'video' };

describe('LicenseSelectorInternal (with hooks)', () => {
  const onLicenseChange = jest.fn();
  const dispatch = jest.fn();

  const props = {
    license: LicenseTypes.select,
    level: LicenseLevel.video,
  };

  const initialState = {
    video: {
      courseLicenseType: LicenseTypes.select,
    },
  };

  beforeEach(() => {
    initializeMocks();
    (hooks.onSelectLicense as jest.Mock).mockReturnValue(onLicenseChange);
    (hooks.determineText as jest.Mock).mockReturnValue({ levelDescription: 'Test level description' });

    jest.spyOn(redux, 'useDispatch').mockReturnValue(dispatch);
  });

  it('renders select with correct options and default value', () => {
    editorRender(<LicenseSelectorInternal {...props} />, { initialState });
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect((select as HTMLSelectElement).value).toBe(props.license);
    expect(screen.getByText(LicenseTypes.allRightsReserved)).toBeInTheDocument();
    expect(screen.getByText(LicenseTypes.creativeCommons)).toBeInTheDocument();
  });

  it('disables select when level is course', () => {
    editorRender(<LicenseSelectorInternal {...props} level={LicenseLevel.course} />, { initialState });
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('shows delete button when level is not course', () => {
    editorRender(<LicenseSelectorInternal {...props} />, { initialState });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('does not show delete button when level is course', () => {
    editorRender(<LicenseSelectorInternal {...props} level={LicenseLevel.course} />, { initialState });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onLicenseChange when select changes', () => {
    editorRender(<LicenseSelectorInternal {...props} />, { initialState });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: LicenseTypes.select } });
    expect(onLicenseChange).toHaveBeenCalledWith(LicenseTypes.select);
  });

  it('dispatches updateField and resets select when delete button clicked', () => {
    editorRender(<LicenseSelectorInternal {...props} />, { initialState });
    fireEvent.click(screen.getByRole('button'));

    expect(dispatch).toHaveBeenCalledWith(actions.video.updateField({
      licenseType: '',
      licenseDetails: {},
    }));
  });

  it('renders level description', () => {
    editorRender(<LicenseSelectorInternal {...props} />, { initialState });
    expect(screen.getByText('Test level description')).toBeInTheDocument();
  });

  it('renders border when license is not select', () => {
    const { container } = editorRender(
      <LicenseSelectorInternal {...props} license={LicenseTypes.allRightsReserved} />,
      { initialState },
    );
    expect(container.querySelector('.border-primary-100')).toBeInTheDocument();
  });

  it('does not render border when license is select', () => {
    const { container } = editorRender(<LicenseSelectorInternal {...props} />, { initialState });
    expect(container.querySelector('.border-primary-100')).not.toBeInTheDocument();
  });
});
