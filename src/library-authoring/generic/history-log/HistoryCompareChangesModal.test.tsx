import { render, screen, initializeMocks } from '@src/testUtils';

import HistoryCompareChangesModal from './HistoryCompareChangesModal';

jest.mock('@src/library-authoring/component-comparison/CompareChangesWidget', () => ({
  __esModule: true,
  default: jest.fn(({ usageKey, oldTitle, oldVersion, newVersion, sideBySide, showTitle }) => (
    <div
      data-testid="compare-changes-widget"
      data-usage-key={usageKey}
      data-old-title={oldTitle ?? ''}
      data-old-version={String(oldVersion ?? '')}
      data-new-version={String(newVersion ?? '')}
      data-side-by-side={String(sideBySide)}
      data-show-title={String(showTitle)}
    />
  )),
}));

describe('<HistoryCompareChangesModal />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders the comparison widget with the selected versions', async () => {
    render(
      <HistoryCompareChangesModal
        isOpen
        onClose={jest.fn()}
        usageKey="lb:org:lib:type:id"
        oldTitle="Electron Arcs"
        oldVersion={3}
        newVersion="published"
      />,
    );

    expect(await screen.findByText('Preview changes: Electron Arcs')).toBeInTheDocument();
    expect(await screen.findByTestId('compare-changes-widget')).toHaveAttribute('data-usage-key', 'lb:org:lib:type:id');
    expect(await screen.findByTestId('compare-changes-widget')).toHaveAttribute('data-old-title', 'Electron Arcs');
    expect(await screen.findByTestId('compare-changes-widget')).toHaveAttribute('data-old-version', '3');
    expect(await screen.findByTestId('compare-changes-widget')).toHaveAttribute('data-new-version', 'published');
    expect(await screen.findByTestId('compare-changes-widget')).toHaveAttribute('data-side-by-side', 'true');
    expect(await screen.findByTestId('compare-changes-widget')).toHaveAttribute('data-show-title', 'true');
  });

  it('renders nothing for container usage keys', () => {
    render(
      <HistoryCompareChangesModal
        isOpen
        onClose={jest.fn()}
        usageKey="lct:org:lib:unit:my-unit-9284e2"
        oldTitle="Intro Unit"
        oldVersion={3}
        newVersion="published"
      />,
    );

    expect(screen.queryByText('Preview changes: Intro Unit')).not.toBeInTheDocument();
    expect(screen.queryByTestId('compare-changes-widget')).not.toBeInTheDocument();
  });
});
