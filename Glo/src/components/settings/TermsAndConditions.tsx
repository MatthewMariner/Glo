'use client';

import React from 'react';
import { Text } from '@chakra-ui/react';
import NavLink from '../link/NavLink';

const TermsAndConditions = () => {
  return (
    <>
      <Text fontSize={'16px'} color="gray.500" fontWeight="500" mb="30px">
        To better serve its clients Mastermind saves its chat box
        communications. By clicking the button below you agree to allow
        Mastermind to store your communications, sign up with the email
        associated with your Mastermind.com account and accept the
        <a
          href="https://mastermind.com/wp-content/uploads/2022/11/22.Terms-of-Service.11.21-2.pdf"
          target="_blank"
        >
          {' '}
          <strong>
            <u>terms and conditions associated with Mastermind.com</u>
          </strong>
        </a>{' '}
      </Text>
    </>
  );
};

export default TermsAndConditions;
