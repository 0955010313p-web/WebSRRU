import React from 'react';
import Button from './Button';

export default {
  title: 'UI/Button',
  component: Button,
};

export const Primary = () => <Button>ปกติ</Button>;
export const Disabled = () => <Button disabled>ปิดใช้</Button>;
