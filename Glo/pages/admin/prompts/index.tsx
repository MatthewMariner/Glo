'use strict';

import { Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PromptTable from '@/components/tables/PromptTable';
import { useAuth } from '@/providers/auth/AuthProvider';
import { wordCount } from '@/utils/wordcount';

type Prompt = {
  id: number;
  content: string;
  createdAt: string | Date;
  deletedAt: string | Date;
  isDefault: boolean;
  userId: string;
  edit: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    password: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    image: string | null;
    ipAddress: string;
    refreshToken: string;
    twoFactorToken: string;
  };
};

type RowObj = {
  id: number;
  isDefault: boolean;
  content: string;
  words: string;
  userEmail: string;
  userId: string;
};

export default function Prompts() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState<RowObj[]>([]);

  const fetchPrompts = async (): Promise<Prompt[]> => {
    const response = await fetch('/api/prisma/getPrompts');
    const data: Prompt[] = await response.json();
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
              isDefault: promptData?.isDefault,
              content: promptData.content,
              words: wordCount(promptData.content),
              userEmail: promptData.user.email,
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
      <PromptTable tableData={tableData} />
    </Box>
  );
}
