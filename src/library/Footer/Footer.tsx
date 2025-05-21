import React from 'react';
import './Footer.scss';
import { FooterProps } from '../interfaces/components';

const Footer: React.FC<FooterProps> = ({
  contactInfo, quickLinks, exploreLinks, logoUrl, copyrights,
}) => {
  // Use class names directly now
  const getAlignClass = (align: string | undefined) => align ?? 'left'; // default to 'left' class if not provided

  return (
    <footer className="footer">
      <div className="container">
        <div className={`section ${getAlignClass(contactInfo.align)}`}>
          <div>
            <img
              style={{ width: '5.5rem', height: '5rem' }}
              src={logoUrl}
              alt="Logo"
            />
          </div>
          <p>{contactInfo.content.shortdesc}</p>
          <p>{contactInfo.content.location.label}, {contactInfo.content.location.value}</p>
          <p>📞 {contactInfo.content.phonenumber}</p>
        </div>

        <div className={`section ${getAlignClass(quickLinks.align)}`}>
          <ul>
            <h3>Quick Links</h3>
            {quickLinks.content.map((link, index) => (
              <li key={index}><a href={link.link}>{link.label}</a></li>
            ))}
          </ul>
        </div>

        <div className={`section ${getAlignClass(exploreLinks.align)}`}>
          <ul>
            <h3>Explore</h3>
            {exploreLinks.content.map((link, index) => (
              <li key={index}><a href={link.link}>{link.label}</a></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="copyright">
        <p>{copyrights}</p>
      </div>
    </footer>
  );
};

export default Footer;
