'use client';
import React from 'react';
import { toast } from '@/hooks/use-toast';
import { SignOutButton } from '@clerk/nextjs';

const SignOutLink = () => {
  const handleLogout = () => {
    toast({
      description: 'You have been signed out.',
    });
  };

  return (
    <SignOutButton>
      <button className='w-full text-left' onClick={handleLogout}>
        Logout
      </button>
    </SignOutButton>
  );
};

export default SignOutLink;
