import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import { Image } from '@openedx/paragon';
import GalleryCard from './GalleryCard';

describe('GalleryCard component', () => {
  const asset = {
    externalUrl: 'props.img.externalUrl',
    displayName: 'props.img.displayName',
    dateAdded: 12345,
  };
  const thumbnailFallback = (<span>Image failed to load</span>);
  let el;
  beforeEach(() => {
    el = shallow(<GalleryCard asset={asset} />);
  });
  test(`snapshot: dateAdded=${asset.dateAdded}`, () => {
    expect(el.snapshot).toMatchSnapshot();
  });
  it('loads Image with src from image external url', () => {
    expect(el.instance.findByType(Image)[0].props.src).toEqual(asset.externalUrl);
  });
  it('snapshot with thumbnail fallback and load error', () => {
    el = shallow(<GalleryCard asset={asset} thumbnailFallback={thumbnailFallback} />);
    el.instance.findByType(Image)[0].props.onError();
    expect(el.snapshot).toMatchSnapshot();
  });
  it('snapshot with thumbnail fallback and no error', () => {
    el = shallow(<GalleryCard asset={asset} thumbnailFallback={thumbnailFallback} />);
    expect(el.snapshot).toMatchSnapshot();
  });
  it('snapshot with status badge', () => {
    el = shallow(<GalleryCard asset={{ ...asset, status: 'failed', statusBadgeVariant: 'danger' }} />);
    expect(el.snapshot).toMatchSnapshot();
  });
  it('snapshot with duration badge', () => {
    el = shallow(<GalleryCard asset={{ ...asset, duration: 60 }} />);
    expect(el.snapshot).toMatchSnapshot();
  });
  it('snapshot with duration transcripts', () => {
    el = shallow(<GalleryCard asset={{ ...asset, transcripts: ['es'] }} />);
    expect(el.snapshot).toMatchSnapshot();
  });
});
