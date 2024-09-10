import React, { useMemo } from 'react';

import {
  fireEvent,
  initializeMocks,
  render,
  waitFor,
} from '../../testUtils';
import { TaxonomyContext } from '../common/context';
import { deleteTaxonomy, getTaxonomy, getTaxonomyExportFile } from '../data/api';
import { TaxonomyMenu } from '.';

const taxonomyId = 1;
const taxonomyName = 'Taxonomy 1';

jest.mock('../data/api', () => ({
  ...jest.requireActual('../data/api'),
  getTaxonomyExportFile: jest.fn(),
  deleteTaxonomy: jest.fn(),
  getTaxonomy: jest.fn(),
}));

const mockSetToastMessage = jest.fn();

/**
 * @type {}
 */
const TaxonomyMenuComponent: React.FC<{
  iconMenu: boolean,
  systemDefined?: boolean,
  canChangeTaxonomy?: boolean,
  canDeleteTaxonomy?: boolean,
}> = ({
  iconMenu,
  systemDefined = false,
  canChangeTaxonomy = true,
  canDeleteTaxonomy = true,
}) => {
  const context = useMemo(() => ({
    toastMessage: null,
    setToastMessage: mockSetToastMessage,
    alertProps: null,
    setAlertProps: null,
  }), []);

  return (
    <TaxonomyContext.Provider value={context}>
      <TaxonomyMenu
        taxonomy={{
          id: taxonomyId,
          name: taxonomyName,
          tagsCount: 0,
          systemDefined,
          canChangeTaxonomy,
          canDeleteTaxonomy,
        }}
        iconMenu={iconMenu}
      />
    </TaxonomyContext.Provider>
  );
};

describe.each([true, false])('<TaxonomyMenu iconMenu=%s />', (iconMenu) => {
  beforeEach(async () => {
    initializeMocks();
  });

  test('should open and close menu on button click', () => {
    const { getByRole, getByTestId, queryByLabelText } = render(
      <TaxonomyMenuComponent iconMenu={iconMenu} />,
    );
    const menuLabelText = 'Actions';
    const menuAltText = `${taxonomyName} actions`;
    const menuButtonText = iconMenu ? menuAltText : menuLabelText;

    // Menu closed/doesn't exist yet
    expect(queryByLabelText(menuLabelText)).not.toBeInTheDocument();

    // Click on the menu button to open
    fireEvent.click(getByRole('button', { name: menuButtonText }));

    // Menu opened
    expect(getByTestId('taxonomy-menu')).toBeVisible();

    // Click on button again to close the menu
    fireEvent.click(getByRole('button', { name: menuButtonText }));

    // Menu closed
    // Jest bug: toBeVisible() isn't checking opacity correctly
    // expect(getByTestId('taxonomy-menu')).not.toBeVisible();
    expect(getByTestId('taxonomy-menu').style.opacity).toEqual('0');
    // TODO: the above should be getByLabelText(menuButtonText) but there is a conflict
    // when iconMenu={true} because the <button> has aria-label in that case.

    // Menu button still visible
    expect(getByRole('button', { name: menuButtonText })).toBeVisible();
  });

  test('Shows menu actions that user is permitted', async () => {
    const { findByTestId, getByTestId, queryByTestId } = render(
      <TaxonomyMenuComponent
        iconMenu={iconMenu}
      />,
    );

    // Click on the menu button to open
    fireEvent.click(await findByTestId('taxonomy-menu-button'));

    // Menu opened
    expect(getByTestId('taxonomy-menu')).toBeVisible();

    // Ensure expected menu items are found
    expect(queryByTestId('taxonomy-menu-export')).toBeInTheDocument();
    expect(queryByTestId('taxonomy-menu-import')).toBeInTheDocument();
    expect(queryByTestId('taxonomy-menu-manageOrgs')).toBeInTheDocument();
    expect(queryByTestId('taxonomy-menu-delete')).toBeInTheDocument();
  });

  test('Hides menu actions that user is not permitted', async () => {
    const { findByTestId, queryByTestId } = render(
      <TaxonomyMenuComponent
        iconMenu={iconMenu}
        systemDefined={false}
        canChangeTaxonomy={false}
        canDeleteTaxonomy={false}
      />,
    );

    // Click on the menu button to open
    fireEvent.click(await findByTestId('taxonomy-menu-button'));

    // Ensure expected menu items are found
    expect(queryByTestId('taxonomy-menu-export')).toBeInTheDocument();
    expect(queryByTestId('taxonomy-menu-import')).not.toBeInTheDocument();
    expect(queryByTestId('taxonomy-menu-manageOrgs')).not.toBeInTheDocument();
    expect(queryByTestId('taxonomy-menu-delete')).not.toBeInTheDocument();
  });

  test('Hides import/delete actions for system-defined taxonomies', () => {
    const systemDefined = true;
    const { getByTestId, queryByTestId } = render(
      <TaxonomyMenuComponent
        iconMenu={iconMenu}
        systemDefined={systemDefined}
      />,
    );

    // Click on the menu button to open
    fireEvent.click(getByTestId('taxonomy-menu-button'));

    // Ensure expected menu items are found
    expect(queryByTestId('taxonomy-menu-export')).toBeInTheDocument();
    expect(queryByTestId('taxonomy-menu-import')).not.toBeInTheDocument();
    expect(queryByTestId('taxonomy-menu-manageOrgs')).toBeInTheDocument();
    expect(queryByTestId('taxonomy-menu-delete')).not.toBeInTheDocument();
  });

  test('should open export modal on export menu click', async () => {
    const { findByTestId, getByText, queryByText } = render(
      <TaxonomyMenuComponent iconMenu={iconMenu} />,
    );

    // Modal closed
    expect(queryByText('Select format to export')).not.toBeInTheDocument();

    // Click on export menu
    fireEvent.click(await findByTestId('taxonomy-menu-button'));
    fireEvent.click(await findByTestId('taxonomy-menu-export'));

    // Modal opened
    expect(getByText('Select format to export')).toBeInTheDocument();

    // Click on cancel button
    fireEvent.click(getByText('Cancel'));

    // Modal closed
    expect(queryByText('Select format to export')).not.toBeInTheDocument();
  });

  test('should call import tags when menu click', async () => {
    const { findByTestId, getByText } = render(<TaxonomyMenuComponent iconMenu={iconMenu} />);

    // Click on import menu
    fireEvent.click(await findByTestId('taxonomy-menu-button'));
    fireEvent.click(await findByTestId('taxonomy-menu-import'));

    expect(getByText('Update "Taxonomy 1"')).toBeInTheDocument();
  });

  test('should export a taxonomy', async () => {
    const {
      findByTestId, getByTestId, getByText, queryByText,
    } = render(<TaxonomyMenuComponent iconMenu={iconMenu} />);

    // Click on export menu
    fireEvent.click(await findByTestId('taxonomy-menu-button'));
    fireEvent.click(await findByTestId('taxonomy-menu-export'));

    // Select JSON format and click on export
    fireEvent.click(getByText('JSON file'));
    fireEvent.click(getByTestId('export-button-1'));

    // Modal closed
    expect(queryByText('Select format to export')).not.toBeInTheDocument();
    expect(getTaxonomyExportFile).toHaveBeenCalledWith(taxonomyId, 'json');
  });

  test('should open delete dialog on delete menu click', async () => {
    const { findByTestId, getByText, queryByText } = render(
      <TaxonomyMenuComponent iconMenu={iconMenu} />,
    );

    // Modal closed
    expect(queryByText(`Delete "${taxonomyName}"`)).not.toBeInTheDocument();

    // Click on delete menu
    fireEvent.click(await findByTestId('taxonomy-menu-button'));
    fireEvent.click(await findByTestId('taxonomy-menu-delete'));

    // Modal opened
    expect(getByText(`Delete "${taxonomyName}"`)).toBeInTheDocument();

    // Click on cancel button
    fireEvent.click(getByText('Cancel'));

    // Modal closed
    expect(queryByText(`Delete "${taxonomyName}"`)).not.toBeInTheDocument();
  });

  test('should delete a taxonomy', async () => {
    const {
      getByTestId, getByLabelText, findByTestId, queryByText,
    } = render(<TaxonomyMenuComponent iconMenu={iconMenu} />);

    // Click on delete menu
    fireEvent.click(await findByTestId('taxonomy-menu-button'));
    fireEvent.click(await findByTestId('taxonomy-menu-delete'));

    const deleteButton = getByTestId('delete-button');

    // The delete button must to be disabled
    expect(deleteButton).toBeDisabled();

    // Testing delete button enabled/disabled changes
    const input = getByLabelText('Type DELETE to confirm');
    fireEvent.change(input, { target: { value: 'DELETE_INVALID' } });
    expect(deleteButton).toBeDisabled();
    fireEvent.change(input, { target: { value: 'DELETE' } });
    expect(deleteButton).toBeEnabled();

    // @ts-ignore
    deleteTaxonomy.mockResolvedValueOnce({});

    // Click on delete button
    fireEvent.click(deleteButton);

    // Modal closed
    expect(queryByText(`Delete "${taxonomyName}"`)).not.toBeInTheDocument();

    await waitFor(async () => {
      expect(deleteTaxonomy).toBeCalledTimes(1);
    });

    // Toast message shown
    expect(mockSetToastMessage).toBeCalledWith(`"${taxonomyName}" deleted`);
  });

  it('should open manage orgs dialog menu click', async () => {
    const {
      findByTestId, findByText, getByText, queryByText,
    } = render(<TaxonomyMenuComponent iconMenu={iconMenu} />);

    // We need to provide a taxonomy or the modal will not open
    // @ts-ignore
    getTaxonomy.mockResolvedValue({
      id: 1,
      name: 'Taxonomy 1',
      orgs: [],
      allOrgs: true,
    });

    // Modal closed
    expect(queryByText('Assign to organizations')).not.toBeInTheDocument();

    // Click on delete menu
    fireEvent.click(await findByTestId('taxonomy-menu-button'));
    fireEvent.click(await findByTestId('taxonomy-menu-manageOrgs'));

    // Modal opened
    expect(await findByText('Assign to organizations')).toBeInTheDocument();

    // Click on cancel button
    fireEvent.click(getByText('Cancel'));

    // Modal closed
    expect(queryByText('Assign to organizations')).not.toBeInTheDocument();
  });
});
