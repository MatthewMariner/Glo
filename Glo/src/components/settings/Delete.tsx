import React, { useState } from 'react';
// Chakra imports
import { Button, useToast } from '@chakra-ui/react';
import Card from '@/components/card/Card';

export default function Settings() {
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const userId = null;

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      const res = await fetch('/api/prisma/deleteUserById', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toast({
        title: 'Account deleted.',
        description: data.message,
        status: 'success',
        duration: 9000,
        isClosable: true,
      });

      // TODO: Add code to handle what should happen after a user deletes their account
    } catch (error: any) {
      toast({
        title: 'An error occurred.',
        description: error,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card
      flexDirection={{ base: 'column', md: 'row' }}
      justifyContent="center"
      alignItems="center"
    >
      <Button
        variant="red"
        py="20px"
        px="16px"
        fontSize="sm"
        borderRadius="45px"
        w={{ base: '100%', md: '210px' }}
        h="54px"
        onClick={handleDeleteAccount}
        isLoading={isDeleting}
      >
        Delete Account
      </Button>
    </Card>
  );
}
