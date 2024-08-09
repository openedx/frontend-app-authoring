import 'CourseAuthoring/editors/setupEditorTest';
import React, { useEffect } from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import * as paragon from '@openedx/paragon';
import * as icons from '@openedx/paragon/icons';

import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { formatMessage } from '../../../testUtils';
import { DimensionControlsInternal as DimensionControls } from './DimensionControls';
import * as hooks from './hooks';

const WrappedDimensionControls = () => {
  const dimensions = hooks.dimensionHooks('altText');

  useEffect(() => {
    dimensions.onImgLoad({ })({ target: { naturalWidth: 1517, naturalHeight: 803 } });
  }, []);

  return <DimensionControls {...dimensions} intl={{ formatMessage }} />;
};

const UnlockedDimensionControls = () => {
  const dimensions = hooks.dimensionHooks('altText');

  useEffect(() => {
    dimensions.onImgLoad({ })({ target: { naturalWidth: 1517, naturalHeight: 803 } });
    dimensions.unlock();
  }, []);

  return <DimensionControls {...dimensions} intl={{ formatMessage }} />;
};

describe('DimensionControls', () => {
  describe('render', () => {
    const props = {
      lockAspectRatio: { width: 4, height: 5 },
      locked: { 'props.locked': 'lockedValue' },
      isLocked: true,
      value: { width: 20, height: 40 },
      // inject
      intl: { formatMessage },
    };
    beforeEach(() => {
      jest.spyOn(hooks, 'onInputChange').mockImplementation((handler) => ({ 'hooks.onInputChange': handler }));
      props.setWidth = jest.fn().mockName('props.setWidth');
      props.setHeight = jest.fn().mockName('props.setHeight');
      props.lock = jest.fn().mockName('props.lock');
      props.unlock = jest.fn().mockName('props.unlock');
      props.updateDimensions = jest.fn().mockName('props.updateDimensions');
    });
    afterEach(() => {
      jest.spyOn(hooks, 'onInputChange').mockRestore();
    });
    test('snapshot', () => {
      expect(shallow(<DimensionControls {...props} />).snapshot).toMatchSnapshot();
    });
    test('null value: empty snapshot', () => {
      const el = shallow(<DimensionControls {...props} value={null} />);
      expect(el.snapshot).toMatchSnapshot();
      expect(el.isEmptyRender()).toEqual(true);
    });
    test('unlocked dimensions', () => {
      const el = shallow(<DimensionControls {...props} isLocked={false} />);
      expect(el.snapshot).toMatchSnapshot();
    });
  });
  describe('component tests for dimensions', () => {
    beforeEach(() => {
      paragon.Form.Group = jest.fn().mockImplementation(({ children }) => (
        <div>{children}</div>
      ));
      paragon.Form.Label = jest.fn().mockImplementation(({ children }) => (
        <div>{children}</div>
      ));
      // eslint-disable-next-line no-import-assign
      paragon.Icon = jest.fn().mockImplementation(({ children }) => (
        <div>{children}</div>
      ));
      // eslint-disable-next-line no-import-assign
      paragon.IconButton = jest.fn().mockImplementation(({ children }) => (
        <div>{children}</div>
      ));
      paragon.Form.Control = jest.fn().mockImplementation(({ value, onChange, onBlur }) => (
        <input className="formControl" onChange={onChange} onBlur={onBlur} value={value} />
      ));
      // eslint-disable-next-line no-import-assign
      icons.Locked = jest.fn().mockImplementation(() => {});
      // eslint-disable-next-line no-import-assign
      icons.Unlocked = jest.fn().mockImplementation(() => {});
    });
    afterEach(() => {
      paragon.Form.Group.mockRestore();
      paragon.Form.Label.mockRestore();
      paragon.Form.Control.mockRestore();
      paragon.Icon.mockRestore();
      paragon.IconButton.mockRestore();
      icons.Locked.mockRestore();
      icons.Unlocked.mockRestore();
    });

    it('renders with initial dimensions', () => {
      const { container } = render(<WrappedDimensionControls />);
      const widthInput = container.querySelector('.formControl');
      expect(widthInput.value).toBe('1517');
    });

    it('resizes dimensions proportionally', async () => {
      const { container } = render(<WrappedDimensionControls />);
      const widthInput = container.querySelector('.formControl');
      expect(widthInput.value).toBe('1517');
      fireEvent.change(widthInput, { target: { value: 758 } });
      await waitFor(() => {
        expect(container.querySelectorAll('.formControl')[0].value).toBe('758');
      });
      fireEvent.blur(widthInput);
      await waitFor(() => {
        expect(container.querySelectorAll('.formControl')[0].value).toBe('758');
        expect(container.querySelectorAll('.formControl')[1].value).toBe('401');
      });
      screen.debug();
    });

    it('resizes only changed dimension when unlocked', async () => {
      const { container } = render(<UnlockedDimensionControls />);
      const widthInput = container.querySelector('.formControl');
      expect(widthInput.value).toBe('1517');
      fireEvent.change(widthInput, { target: { value: 758 } });
      await waitFor(() => {
        expect(container.querySelectorAll('.formControl')[0].value).toBe('758');
      });
      fireEvent.blur(widthInput);
      await waitFor(() => {
        expect(container.querySelectorAll('.formControl')[0].value).toBe('758');
        expect(container.querySelectorAll('.formControl')[1].value).toBe('803');
      });
      screen.debug();
    });
  });
});
