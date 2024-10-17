import { useParams } from 'react-router-dom';

import { LibraryProvider } from '../common/context';
import { getLibraryId } from '../../generic/key-utils';
import CompareChangesWidget from '../component-comparison/CompareChangesWidget';

/**
 * This view is only used to support the legacy UI.
 * On the legacy unit page, when a v2 library block has been used in a course
 * AND an updated version of that block is available, this view is rendered in
 * an iframe in a modal, and allows the author to preview the changes before
 * accepting them (before syncing the course version with the latest library
 * version).
 *
 * The inner <CompareChangesWidget> will be used by this MFE as well, on the
 * new MFE unit page.
 */
const PreviewChangesEmbed = () => {
  const { usageKey } = useParams();
  if (usageKey === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Error: route is missing usageKey.');
  }
  const libraryId = getLibraryId(usageKey);

  return (
    <LibraryProvider libraryId={libraryId}>
      <CompareChangesWidget usageKey={usageKey} />
    </LibraryProvider>
  );
};

export default PreviewChangesEmbed;
