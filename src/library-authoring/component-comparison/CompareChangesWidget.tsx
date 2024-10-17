import { Tab, Tabs } from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';

import { LibraryBlock } from '../LibraryBlock';
import { useLibraryBlockMetadata } from '../data/apiHooks';

interface Props {
  usageKey: string;
}

const CompareChangesWidget = ({ usageKey }: Props) => {
  const { data: metadata } = useLibraryBlockMetadata(usageKey);

  const [queryString] = useSearchParams();
  const oldVersion = parseInt(queryString.get('old') ?? '', 10) || 'draft';

  return (
    <div>
      <Helmet><title>Compare Changes | {metadata?.displayName ?? ''} | {process.env.SITE_NAME}</title></Helmet>
      <Tabs variant="tabs" defaultActiveKey="new" id="preview-version-toggle">
        <Tab eventKey="old" title="Old version">
          <div className="p-2 bg-white">
            <LibraryBlock usageKey={usageKey} version={oldVersion} />
          </div>
        </Tab>
        <Tab eventKey="new" title="New version">
          <div className="p-2 bg-white">
            <LibraryBlock usageKey={usageKey} version="published" />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default CompareChangesWidget;
