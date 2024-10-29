import { Provider } from 'react-redux';
import {
  fireEvent,
  render,
  screen,
  initializeMocks,
} from '../../../../../testUtils';
import editorStore from '../../../../data/store';
import { EditorContextProvider } from '../../../../EditorContext';
import * as hooks from './hooks';
import SelectTypeModal from '.';

describe('SelectTypeModal', () => {
  beforeEach(() => {
    initializeMocks();
  });
  test('it can select a basic problem type', async () => {
    const mockClose = jest.fn();
    const mockSelect = jest.fn();
    jest.spyOn(hooks, 'onSelect').mockImplementation(mockSelect);
    // This is a new-style test, unlike most of the old snapshot-based editor tests.
    render(
      <EditorContextProvider fullScreen={false} learningContextId="course-v1:Org+COURSE+RUN">
        <Provider store={editorStore}>
          <SelectTypeModal onClose={mockClose} />
        </Provider>
      </EditorContextProvider>,
    );

    // First we see the menu of problem types:
    expect(await screen.findByRole('button', { name: 'Numerical input' })).toBeInTheDocument();
    // And the "Advanced" types are not yet listed:
    expect(screen.queryByRole('radio', { name: 'Custom JavaScript display and grading' })).not.toBeInTheDocument();

    // Before we select a problem type, try viewing the advanced types and then going back:
    const advancedButton = await screen.findByRole('button', { name: 'Advanced problem types' });
    fireEvent.click(advancedButton);

    // Now we see the advanced types:
    await screen.findByRole('radio', { name: 'Custom JavaScript display and grading' });
    expect(screen.queryByRole('button', { name: 'Numerical input' })).not.toBeInTheDocument();

    const goBackButton = screen.getByRole('button', { name: 'Go back' });
    fireEvent.click(goBackButton);

    const numericalInputBtn = await screen.findByRole('button', { name: 'Numerical input' });
    fireEvent.click(numericalInputBtn);

    // Now we save our selection:
    const selectBtn = screen.getByRole('button', { name: 'Select' });
    fireEvent.click(selectBtn);
    expect(mockSelect).toHaveBeenLastCalledWith(expect.objectContaining({ selected: 'numericalresponse' }));
  });
});
