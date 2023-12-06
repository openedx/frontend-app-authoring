import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { SUBMISSION_STATUS, ROUTES } from '@src/library-authoring/common';
import { ctxMount } from '@src/library-authoring/common/specs/helpers';
import { withNavigate } from '@src/library-authoring/utils/hoc';
import { libraryCreateInitialState } from '../data';
import { LibraryCreatePage } from '../LibraryCreatePage';
import messages from '../messages';

const InjectedLibraryCreatePage = injectIntl(withNavigate(LibraryCreatePage));
const config = { STUDIO_BASE_URL: 'STUDIO_BASE_URL' };
const mockResetForm = jest.fn();
const mockCreateLibrary = jest.fn();
const mockFetchOrganizations = jest.fn();
const props = {
  ...libraryCreateInitialState,
  resetForm: mockResetForm,
  createLibrary: mockCreateLibrary,
  fetchOrganizations: mockFetchOrganizations,
};
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('create-library/LibraryCreatePage.jsx', () => {
  it('renders library create page without error', () => {
    ctxMount(
      <BrowserRouter>
        <InjectedLibraryCreatePage {...props} />
      </BrowserRouter>,
      { config },
    );
  });

  it('fetches organizations list on mount', () => {
    ctxMount(
      <BrowserRouter>
        <InjectedLibraryCreatePage {...props} />
      </BrowserRouter>,
      { config },
    );

    expect(mockFetchOrganizations).toHaveBeenCalled();
  });

  it('submits form without error', () => {
    const newProps = { ...props, orgs: ['org1', 'org2'] };
    const container = ctxMount(
      <BrowserRouter>
        <InjectedLibraryCreatePage {...newProps} />
      </BrowserRouter>,
      { config },
    );

    container.find('input').at(0).simulate('change', { target: { value: 'title test', name: 'title' } });
    container.find('input').at(1).simulate('change', { target: { value: 'org1', name: 'org' } });
    container.find('input').at(2).simulate('change', { target: { value: 'slug test', name: 'slug' } });

    const form = container.find('form').at(0);
    form.simulate('submit');

    expect(mockCreateLibrary).toHaveBeenCalled();
  });

  describe('form errors', () => {
    let container;
    beforeEach(() => {
      const newProps = { ...props, errorFields: { slug: 'Error message' } };
      container = ctxMount(
        <BrowserRouter>
          <InjectedLibraryCreatePage {...newProps} />
        </BrowserRouter>,
        { config },
      );
    });

    it('shows empty title error', () => {
      container.find('input').at(0).simulate('change');
      expect(container.find('.pgn__form-text-invalid').at(0).text()).toEqual(messages['library.form.field.error.empty.title'].defaultMessage);
    });

    it('shows empty org error', () => {
      container.find('input').at(1).simulate('change');
      container.find('input').at(1).simulate('blur');
      expect(container.find('.pgn__form-text-invalid').at(0).text()).toEqual(messages['library.form.field.error.empty.org'].defaultMessage);
    });

    it('shows empty slug error', () => {
      container.find('input').at(2).simulate('change');
      expect(container.find('.pgn__form-text-invalid').at(0).text()).toEqual(messages['library.form.field.error.empty.slug'].defaultMessage);
    });

    it('shows mismatch org error', () => {
      container.find('input').at(1).simulate('change', { target: { value: 'org2', name: 'org' } });
      container.find('input').at(1).simulate('blur');
      expect(container.find('.pgn__form-text-invalid').at(0).text()).toEqual(messages['library.form.field.error.mismatch.org'].defaultMessage);
    });

    it('shows invlaid slug error', () => {
      container.find('input').at(2).simulate('change', { target: { value: '###', name: 'slug' } });
      expect(container.find('.pgn__form-text-invalid').at(0).text()).toEqual(messages['library.form.field.error.invalid.slug'].defaultMessage);
    });
  });

  it('shows processing text on button', () => {
    const newProps = { ...props, status: SUBMISSION_STATUS.SUBMITTING };
    const container = ctxMount(
      <BrowserRouter>
        <InjectedLibraryCreatePage {...newProps} />
      </BrowserRouter>,
      { config },
    );

    const submitButton = container.find('[type="submit"]').at(0);
    expect(submitButton.text()).toEqual('Creating...');
  });

  it('cancels form', () => {
    const container = ctxMount(
      <BrowserRouter>
        <InjectedLibraryCreatePage {...props} />
      </BrowserRouter>,
      { config },
    );

    const cancelPageButton = container.find('button.btn-light').at(0);
    cancelPageButton.simulate('click');
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.List.HOME);
  });

  it('shows leave modal and prevents leaving', () => {
    const container = ctxMount(
      <BrowserRouter>
        <InjectedLibraryCreatePage {...props} />
      </BrowserRouter>,
      { config },
    );

    const cancelPageButton = container.find('button.btn-light').at(0);
    container.find('input').at(0).simulate('change', { target: { value: 'title test', name: 'title' } });
    cancelPageButton.simulate('click');

    // The leave page modal was shown and history was updated but blocked
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.List.HOME);
    expect(container.find('.pgn__modal-title').text()).toEqual('Unsaved changes');

    // Reject the leave page modal
    const cancelModalButton = container.find('.pgn__modal .btn-tertiary');
    cancelModalButton.simulate('click');
    expect(container.find('.pgn__modal-title').exists()).toEqual(false);

    // Confirm the leave page modal and wasn't blocked
    cancelPageButton.simulate('click');
    const SubmitModalButton = container.find('.pgn__modal .btn-primary');
    SubmitModalButton.simulate('click');
    expect(container.find('.pgn__modal-title').exists()).toEqual(false);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.List.HOME);
  });
});
