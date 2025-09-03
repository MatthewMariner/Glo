'use strict';

import { Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import UserTable from '@/components/tables/UserTable';
import { useAuth } from '@/providers/auth/AuthProvider';

interface User {
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
}

interface RowObj {
  email: string;
  role: string;
  date: string | Date;
}

export default function Users() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState<RowObj[]>([]);

  const fetchUsers = async (): Promise<User[]> => {
    const response = await fetch('/api/prisma/getActiveUsers');
    const data: User[] = await response.json();
    return data;
  };

  // Check for user role
  useEffect(() => {
    if (currentUser) {
      setIsLoading(false);
      if (currentUser.role !== 'ADMIN') {
        router.push('/');
      } else {
        fetchUsers().then((users) => {
          const formattedUsers: RowObj[] = users.map((user, index) => ({
            id: user.id,
            email: user.email,
            role: user.role,
            date: new Date(user.createdAt),
          }));

          setTableData(formattedUsers);
        });
      }
    }
  }, [currentUser, router]);

  if (isLoading) {
    return null;
  }

  return (
    <Box mt={{ base: '70px', md: '0px', xl: '0px' }}>
      <UserTable tableData={tableData} />
    </Box>
  );
}
