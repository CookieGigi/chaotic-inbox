import type { Meta, StoryObj } from '@storybook/react-vite'
import { ImageBlock } from './ImageBlock'

const meta: Meta<typeof ImageBlock> = {
  title: 'Components/ImageBlock',
  component: ImageBlock,
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text' },
    alt: { control: 'text' },
    width: { control: 'number' },
    height: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof ImageBlock>

export const Default: Story = {
  args: {
    src: 'https://picsum.photos/800/400',
    alt: 'Sample image',
    width: 800,
    height: 400,
  },
}

export const WithoutAlt: Story = {
  args: {
    src: 'https://picsum.photos/600/300',
    width: 600,
    height: 300,
  },
}

export const SmallImage: Story = {
  args: {
    src: 'https://picsum.photos/200/100',
    alt: 'Small image',
    width: 200,
    height: 100,
  },
}

export const LargeImage: Story = {
  args: {
    src: 'https://picsum.photos/1920/1080',
    alt: 'Large image that should be constrained',
    width: 1920,
    height: 1080,
  },
}

export const DataUri: Story = {
  args: {
    src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOGJkNWNhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMTgxOTI2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U1ZHIERhdGEgVVJJPC90ZXh0Pjwvc3ZnPg==',
    alt: 'Inline SVG via data URI',
  },
}
