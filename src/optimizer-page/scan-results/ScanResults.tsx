import { useState, useMemo, FC } from 'react';
import {
  Card,
  Form,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import SectionCollapsible from './SectionCollapsible';
import BrokenLinkTable from './BrokenLinkTable';
import LockedInfoIcon from './LockedInfoIcon';
import { LinkCheckResult } from '../types';
import { countBrokenLinks } from '../utils';

const InfoCard: FC<{ text: string }> = ({ text }) => (
  <Card className="mt-4">
    <h3
      className="subsection-header"
      style={{ margin: '1rem', textAlign: 'center' }}
    >
      {text}
    </h3>
  </Card>
);

interface Props {
  data: LinkCheckResult | null;
}

const ScanResults: FC<Props> = ({ data }) => {
  const intl = useIntl();
  const [showLockedLinks, setShowLockedLinks] = useState(true);

  const {
    brokenLinksCounts,
    lockedLinksCounts,
    externalForbiddenLinksCounts,
  } = useMemo(() => countBrokenLinks(data), [data?.sections]);

  if (!data?.sections) {
    return <InfoCard text={intl.formatMessage(messages.noBrokenLinksCard)} />;
  }

  const { sections } = data;

  return (
    <div className="scan-results">
      <div className="border-bottom border-light-400 mb-3">
        <header className="sub-header-content">
          <h2 className="sub-header-content-title">{intl.formatMessage(messages.scanHeader)}</h2>
          <Form.Group className="locked-links-checkbox-wrapper">
            <Form.Checkbox
              className="locked-links-checkbox"
              checked={showLockedLinks}
              onChange={() => {
                setShowLockedLinks(!showLockedLinks);
              }}
            >
              {intl.formatMessage(messages.lockedCheckboxLabel)}
            </Form.Checkbox>
            <LockedInfoIcon />
          </Form.Group>
        </header>
      </div>

      {sections?.map((section, index) => (
        <SectionCollapsible
          key={section.id}
          title={section.displayName}
          redItalics={intl.formatMessage(messages.brokenLinksNumber, { count: brokenLinksCounts[index] })}
          yellowItalics={!showLockedLinks ? '' : intl.formatMessage(messages.lockedLinksNumber, { count: lockedLinksCounts[index] })}
          greenItalics={
            intl.formatMessage(messages.externalForbiddenLinksNumber, { count: externalForbiddenLinksCounts[index] })
          }
        >
          {section.subsections.map((subsection) => (
            <>
              <h2
                className="subsection-header"
                style={{ marginBottom: '2rem' }}
              >
                {subsection.displayName}
              </h2>
              {subsection.units.map((unit) => (
                <div className="unit">
                  <BrokenLinkTable unit={unit} showLockedLinks={showLockedLinks} />
                </div>
              ))}
            </>
          ))}
        </SectionCollapsible>
      ))}
    </div>
  );
};

export default ScanResults;
