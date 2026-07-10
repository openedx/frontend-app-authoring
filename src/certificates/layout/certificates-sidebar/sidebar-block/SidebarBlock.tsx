import React, { ReactElement } from 'react';

interface SidebarBlockProps {
  title: string;
  paragraphs: (string | ReactElement)[];
  isLast: boolean;
}

const SidebarBlock = ({
  title,
  paragraphs,
  isLast = false,
}: SidebarBlockProps) => (
  <React.Fragment key={title}>
    <h4 className="help-sidebar-about-title">
      {title}
    </h4>
    {paragraphs.map((text, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <p key={index} className="help-sidebar-about-descriptions">
        {text}
      </p>
    ))}
    {!isLast && <hr />}
  </React.Fragment>
);

export default SidebarBlock;
