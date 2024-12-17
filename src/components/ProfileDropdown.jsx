import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';


const ProfileDropdown = () => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Avatar className='p-1 text-neutral-800 bg-emerald-400' icon={<UserOutlined />} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="flex flex-col text-neutral-600 dark:text-neutral-300 bg-neutral-300 dark:bg-neutral-800 p-1 mr-2 rounded-md">
        <DropdownMenu.Item className='p-2 rounded hover:text-neutral-900 hover:bg-neutral-200 hover:underline hover:decoration-solid hover:underline-offset-4'>
          <a href="/profile">Profile</a>
        </DropdownMenu.Item>
        <DropdownMenu.Item className='p-2 rounded hover:text-neutral-900 hover:bg-neutral-200 hover:underline hover:decoration-solid hover:underline-offset-4'>
          <a href="/logout">Logout</a>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default ProfileDropdown;