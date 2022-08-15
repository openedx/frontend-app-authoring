import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { withRouter, Router } from 'react-router';
import { createMemoryHistory } from 'history';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { LibraryCreatePage } from '../LibraryCreatePage';
import { libraryCreateInitialState } from '../data';
import { SUBMISSION_STATUS, ROUTES } from '../../common';
import { ctxMount } from '../../common/specs/helpers';

const InjectedLibraryCreatePage = injectIntl(withRouter(LibraryCreatePage));
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

  it('shows form errors', () => {
    const newProps = { ...props, errorFields: { slug: 'Error message' } };
    const container = ctxMount(
      <BrowserRouter>
        <InjectedLibraryCreatePage {...newProps} />
      </BrowserRouter>,
      { config },
    );
    container.find('input').at(0).simulate('blur');
    container.find('input').at(1).simulate('change', { target: { value: 'org2', name: 'org' } });
    container.find('input').at(1).simulate('blur');
    container.find('input').at(2).simulate('change', { target: { value: '###', name: 'slug' } });
    container.find('input').at(2).simulate('blur');
    expect(container.find('.pgn__form-text-invalid').at(0).text()).toEqual('This field may not be blank.');
    expect(container.find('.pgn__form-text-invalid').at(1).text()).toEqual('The organization might be selected from the options list.');
    expect(container.find('.pgn__form-text-invalid').at(2).text()).toEqual('Enter a valid “slug” consisting of Unicode letters, numbers, underscores, or hyphens.');
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
    const history = createMemoryHistory({ initialEntries: [ROUTES.List.CREATE] });
    jest.spyOn(history, 'push');

    const container = ctxMount(
      <BrowserRouter>
        <Router history={history}>
          <InjectedLibraryCreatePage {...props} />
        </Router>
      </BrowserRouter>,
      { config },
    );

    const cancelPageButton = container.find('button.btn-light').at(0);
    cancelPageButton.simulate('click');
    expect(history.push).toHaveBeenCalledWith(ROUTES.List.HOME);
  });

  it('shows leave modal and prevents leaving', () => {
    const history = createMemoryHistory({ initialEntries: [ROUTES.List.CREATE] });
    jest.spyOn(history, 'push');
    jest.spyOn(history, 'block');

    const container = ctxMount(
      <BrowserRouter>
        <Router history={history}>
          <InjectedLibraryCreatePage {...props} />
        </Router>
      </BrowserRouter>,
      { config },
    );

    const cancelPageButton = container.find('button.btn-light').at(0);
    container.find('input').at(0).simulate('change', { target: { value: 'title test', name: 'title' } });
    cancelPageButton.simulate('click');

    // The leave page modal was shown and history was updated but blocked
    expect(history.push).toHaveBeenCalledWith(ROUTES.List.HOME);
    expect(history.block).toHaveBeenCalledTimes(1);
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
    expect(history.push).toHaveBeenCalledWith(ROUTES.List.HOME);
    expect(history.block).toHaveBeenCalledTimes(1);
  });
});
