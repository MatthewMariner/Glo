'use strict';

import { Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import UserPromptTable from '@/components/tables/UserPromptTable';
import { useAuth } from '@/providers/auth/AuthProvider';
import { wordCount } from '@/utils/wordcount';
import type { UserPrompt } from '@prisma/client';

type RowObj = {
  id: number;
  content: string;
  category: string;
  words: string;
  userEmail: string;
  userId: string;
};

export default function UserPrompts() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState<RowObj[]>([]);

  const fetchPrompts = async (): Promise<UserPrompt[]> => {
    const response = await fetch('/api/prisma/getUserPrompts');
    const data: UserPrompt[] = await response.json();
    return data;
  };

  // Check for user role
  useEffect(() => {
    if (currentUser) {
      setIsLoading(false);
      if (currentUser.role !== 'ADMIN') {
        router.push('/');
      } else {
        fetchPrompts()
          .then((data) => {
            const formattedPrompts = data.map((promptData) => ({
              id: promptData.id,
              category: promptData.category,
              content: promptData.content,
              words: wordCount(promptData.content),
              userEmail: promptData?.user.email,
              userId: promptData.userId,
            }));

            setTableData(formattedPrompts);
            setIsLoading(false);
          })
          .catch((error) => {
            console.error('Error:', error);
            setIsLoading(false);
          });
      }
    }
  }, [currentUser, router]);

  if (isLoading) {
    return null;
  }

  return (
    <Box mt={{ base: '70px', md: '0px', xl: '0px' }}>
      <UserPromptTable tableData={tableData} />
    </Box>
  );
}
