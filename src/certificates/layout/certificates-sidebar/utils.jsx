export const getSidebarData = ({ messages, intl }) => [
  {
    title: intl.formatMessage(messages.workingWithCertificatesTitle),
    paragraphs: [
      intl.formatMessage(messages.workingWithCertificatesFirstParagraph),
      intl.formatMessage(
        messages.workingWithCertificatesSecondParagraph,
        { strongText: <strong>{intl.formatMessage(messages.workingWithCertificatesSecondParagraph_strong)}</strong> },
      ),
      intl.formatMessage(
        messages.workingWithCertificatesThirdParagraph,
        { strongText: <strong>{intl.formatMessage(messages.workingWithCertificatesThirdParagraph_strong)}</strong> },
      ),
    ],
  },
  {
    title: intl.formatMessage(messages.issuingCertificatesTitle),
    paragraphs: [
      intl.formatMessage(
        messages.issuingCertificatesFirstParagraph,
        { strongText: <strong>{intl.formatMessage(messages.issuingCertificatesFirstParagraph_strong)}</strong> },
      ),
      intl.formatMessage(
        messages.issuingCertificatesSecondParagraph,
        { strongText: <strong>{intl.formatMessage(messages.issuingCertificatesSecondParagraph_strong)}</strong> },
      ),
    ],
  },
];
