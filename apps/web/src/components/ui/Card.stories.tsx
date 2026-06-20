import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import Card from './Card';

export default {
  title: 'UI/Card',
  component: Card,
} as ComponentMeta<typeof Card>;

const Template: ComponentStory<typeof Card> = (args) => <Card {...args} />;

export const Default = Template.bind({});
Default.args = { children: <div style={{padding:16}}>Card content</div> };
