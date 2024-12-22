import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { LuTent } from 'react-icons/lu';

const Logo = () => {
  return (
    <Button size={'icon'} asChild>
      <Link href={'/'}>
        <LuTent className='text-3xl' />
      </Link>
    </Button>
  );
};

export default Logo;
