import React from 'react';
import {
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import { Layout } from '@edx/paragon';

import messages from './messages';

const ExportFooter = ({ intl }) => (
  <footer className="mt-4 small">
    <Layout
      lg={[{ span: 6 }, { span: 6 }]}
      md={[{ span: 6 }, { span: 6 }]}
      sm={[{ span: 6 }, { span: 6 }]}
      xs={[{ span: 6 }, { span: 6 }]}
      xl={[{ span: 6 }, { span: 6 }]}
    >
      <Layout.Element>
        <h4>{intl.formatMessage(messages.exportedDataTitle)}</h4>
        <ul className="export-footer-list">
          <li>{intl.formatMessage(messages.exportedDataItem1)}</li>
          <li>{intl.formatMessage(messages.exportedDataItem2)}</li>
          <li>{intl.formatMessage(messages.exportedDataItem3)}</li>
          <li>{intl.formatMessage(messages.exportedDataItem4)}</li>
          <li>{intl.formatMessage(messages.exportedDataItem5)}</li>
          <li>{intl.formatMessage(messages.exportedDataItem6)}</li>
          <li>{intl.formatMessage(messages.exportedDataItem7)}</li>
        </ul>
      </Layout.Element>
      <Layout.Element>
        <h4>{intl.formatMessage(messages.notExportedDataTitle)}</h4>
        <ul className="export-footer-list">
          <li>{intl.formatMessage(messages.notExportedDataItem1)}</li>
          <li>{intl.formatMessage(messages.notExportedDataItem2)}</li>
          <li>{intl.formatMessage(messages.notExportedDataItem3)}</li>
          <li>{intl.formatMessage(messages.notExportedDataItem4)}</li>
        </ul>
      </Layout.Element>
    </Layout>
  </footer>
);

ExportFooter.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(ExportFooter);
