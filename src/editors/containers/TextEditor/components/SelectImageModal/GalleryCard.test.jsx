import React from 'react';
import { shallow } from 'enzyme';

import { Image } from '@edx/paragon';
import { GalleryCard } from './GalleryCard';

describe('GalleryCard component', () => {
  const img = {
    externalUrl: 'props.img.externalUrl',
    displayName: 'props.img.displayName',
    dateAdded: 12345,
  };
  let el;
  beforeEach(() => {
    el = shallow(<GalleryCard img={img} />);
  });
  test(`snapshot: dateAdded=${img.dateAdded}`, () => {
    expect(el).toMatchSnapshot();
  });
  it('loads Image with src from image external url', () => {
    expect(el.find(Image).props().src).toEqual(img.externalUrl);
  });
});
