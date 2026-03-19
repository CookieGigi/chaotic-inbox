import type { Meta, StoryObj } from '@storybook/react-vite'
import { Template } from './Template'

const meta = {
  title: 'Components/Template',
  component: Template,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Template>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Example Item',
    children: 'This is a template component example.',
  },
}

export const WithComplexContent: Story = {
  args: {
    title: 'Complex Content Example',
    children: (
      <div>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <button type="button" onClick={() => alert('Clicked!')}>
          Action Button
        </button>
      </div>
    ),
  },
}

export const WithNestedComponents: Story = {
  args: {
    title: 'Nested Components',
    children: (
      <>
        <p>This demonstrates composition pattern with nested elements:</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      </>
    ),
  },
}
