import { useIntl } from '@edx/frontend-platform/i18n';
import { Tab, Tabs } from '@openedx/paragon';
import TeamTable from './components/TeamTable';
import AuthZLayout from '../components/AuthZLayout';
import { LibraryAuthZProvider, useLibraryAuthZ } from './context';

import messages from './messages';

const LibrariesAuthZView = () => {
  const intl = useIntl();
  const { libraryId, libraryName, libraryOrg } = useLibraryAuthZ();
  const rootBradecrumb = intl.formatMessage(messages['library.authz.breadcrumb.root']) || '';
  const pageTitle = intl.formatMessage(messages['library.authz.manage.page.title']);
  return (
    <div className="authz-libraries">
      <AuthZLayout
        context={{ id: libraryId, title: libraryName, org: libraryOrg }}
        navLinks={[{ label: rootBradecrumb }]}
        activeLabel={pageTitle}
        pageTitle={pageTitle}
        pageSubtitle={libraryId}
        actions={[]}
      >
        <Tabs
          variant="tabs"
          defaultActiveKey="team"
          className="bg-light-100 px-5"
        >
          <Tab eventKey="team" title="Team Members" className="p-5">
            <TeamTable />
          </Tab>
          <Tab eventKey="roles" title="Roles">
            Role tab.
          </Tab>
          <Tab eventKey="permissions" title="Permissions">
            Permissions tab.
          </Tab>
        </Tabs>
      </AuthZLayout>
    </div>
  );
};
const LibrariesAuthZManager = () => (
  <LibraryAuthZProvider>
    <LibrariesAuthZView />
  </LibraryAuthZProvider>
);

export default LibrariesAuthZManager;
