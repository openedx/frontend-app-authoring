/* eslint-disable linebreak-style */

type TextAlign = 'right' | 'left' | 'center';
export interface FooterProps {
  contactInfo: {
    align: TextAlign;
    content: {
      shortdesc: string;
      address1: string;
      address2: string;
      pincode: string;
      location: { label: string; value: string };
      phonenumber: string;
      facebook: string;
      instagram: string;
      twitter: string;
      linkedIn: string;
    };
  };
  quickLinks: {
    align: TextAlign;
    content: { label: string; link: string }[];
  };
  exploreLinks: {
    align: TextAlign;
    content: { label: string; link: string }[];
  };
  logoUrl: string;
}
