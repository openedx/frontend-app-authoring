import { Stack } from '@openedx/paragon';

interface Props {
  title: React.ReactNode;
  children: React.ReactNode;
  side: 'Before' | 'After';
}

const ChildrenPreview = ({ title, children, side }: Props) => (
  <Stack direction="vertical">
    <span className="text-center">{side}</span>
    <span className="mt-2 mb-3 text-md text-gray-800">{title}</span>
    {children}
  </Stack>
);

export default ChildrenPreview;
