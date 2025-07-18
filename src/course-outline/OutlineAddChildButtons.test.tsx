import userEvent from '@testing-library/user-event';
import { ContainerType } from '@src/generic/key-utils';
import {
  initializeMocks, render, screen, waitFor,
} from '@src/testUtils';
import OutlineAddChildButtons from './OutlineAddChildButtons';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn().mockReturnValue({ librariesV2Enabled: true }),
}));

[
  { containerType: ContainerType.Section },
  { containerType: ContainerType.Subsection },
  { containerType: ContainerType.Unit },
].forEach(({ containerType }) => {
  describe(`<OutlineAddChildButtons> for ${containerType}`, () => {
    beforeEach(() => {
      initializeMocks();
    });

    it('renders and behaves correctly', async () => {
      const newClickHandler = jest.fn();
      const useFromLibClickHandler = jest.fn();
      render(<OutlineAddChildButtons
        handleNewButtonClick={newClickHandler}
        handleUseFromLibraryClick={useFromLibClickHandler}
        childType={containerType}
      />);

      const newBtn = await screen.findByRole('button', { name: `New ${containerType}` });
      expect(newBtn).toBeInTheDocument();
      const useBtn = await screen.findByRole('button', { name: `Use ${containerType} from library` });
      expect(useBtn).toBeInTheDocument();
      userEvent.click(newBtn);
      waitFor(() => expect(newClickHandler).toHaveBeenCalled());
      userEvent.click(useBtn);
      waitFor(() => expect(useFromLibClickHandler).toHaveBeenCalled());
    });
  });
});
