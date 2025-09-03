'use client';
/* eslint-disable */

import {
  Badge,
  Button,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Icon,
  Stack,
  Checkbox,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react';
import Card from '@/components/card/Card';
import { MdChevronRight, MdChevronLeft } from 'react-icons/md';
import * as React from 'react';
import { SearchBar } from '@/components/search';

import {
  PaginationState,
  createColumnHelper,
  useReactTable,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

type RowObj = {
  email: string;
  role: string;
  date: string | Date;
  [x: string]: any;
};

export default function SearchTableOrders(props: { tableData: RowObj[] }) {
  const { tableData } = props;
  const textColor = useColorModeValue('navy.700', 'white');
  const textSecondaryColor = useColorModeValue('gray.500', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRole, setSelectedRole] = React.useState('');
  const [currentUserId, setCurrentUserId] = React.useState('');

  const columnHelper = createColumnHelper<RowObj>();
  const columns = [
    columnHelper.accessor('', {
      id: 'name',
      header: () => <Checkbox colorScheme="brandScheme" me="10px" />,
      cell: (info: any) => (
        <Flex align="center">
          <Checkbox colorScheme="brandScheme" me="10px" />
        </Flex>
      ),
    }),
    columnHelper.accessor('email', {
      id: 'email',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize="xs"
          fontWeight="500"
          color={textSecondaryColor}
        >
          EMAIL
        </Text>
      ),
      cell: (info: any) => (
        <Text color={textColor} fontSize="sm" fontWeight="500">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('role', {
      id: 'role',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize="xs"
          fontWeight="500"
          color={textSecondaryColor}
        >
          ROLE
        </Text>
      ),
      cell: (info) => (
        <Select
          value={info.getValue()}
          onChange={(e) => {
            setSelectedRole(e.target.value);
            setCurrentUserId(info.row.original.id);
            onOpen();
            editUserRole(info.row.original.id, e.target.value, info.row);
          }}
        >
          <option value="ADMIN">ADMIN</option>
          <option value="USER">USER</option>
        </Select>
      ),
    }),
    columnHelper.accessor('date', {
      id: 'date',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize="xs"
          fontWeight="500"
          color={textSecondaryColor}
        >
          DATE
        </Text>
      ),
      cell: (info) => {
        // Extract date
        let date = new Date(info.getValue());

        // Format the date
        let formattedDate = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        return (
          <Text color={textColor} fontSize="sm" fontWeight="500">
            {formattedDate}
          </Text>
        );
      },
    }),
  ];

  const [data, setData] = React.useState<RowObj[]>([]);

  React.useEffect(() => {
    setData([...tableData]);
  }, [tableData]);

  console.log(data);

  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 25,
    });

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );
  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      globalFilter,
      pagination,
    },
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });
  const createPages = (count: number) => {
    let arrPageCount = [];

    for (let i = 1; i <= count; i++) {
      arrPageCount.push(i);
    }

    return arrPageCount;
  };

  React.useEffect(() => {
    if (table.getState().columnFilters[0]?.id === 'fullName') {
      if (table.getState().sorting[0]?.id !== 'fullName') {
        table.setSorting([{ id: 'fullName', desc: false }]);
      }
    }
  }, [table.getState().columnFilters[0]?.id]);

  async function editUserRole(userId: string, role: string, row: any) {
    const response = await fetch('/api/prisma/editUserById', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: userId,
        role: role,
      }),
    });

    if (!response.ok) {
      // handle error
      console.error('Error updating user role');
      return;
    }

    // handle success
    console.log('Role updated successfully');

    // Find index of the updated user
    const userIndex = data.findIndex((user) => user.id === userId);
    // Create a copy of the data
    const newData = [...data];
    // Update the role of the user at the found index
    newData[userIndex].role = role;
    // Set the new data state
    setData(newData);
  }

  return (
    <Card flexDirection="column" w="100%" px="0px">
      <Flex
        align={{ sm: 'flex-start', lg: 'flex-start' }}
        justify={{ sm: 'flex-start', lg: 'flex-start' }}
        w="100%"
        px="20px"
      >
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={(value) => setGlobalFilter(String(value))}
          placeholder="Search prompt"
        />
        <Button
          variant="primary"
          py="20px"
          px="16px"
          fontSize="sm"
          borderRadius="45px"
          w={{ base: '100%', md: '140px' }}
          h="44px"
        >
          Search
        </Button>
      </Flex>
      <Flex maxW="100%" overflowX={{ base: 'scroll', lg: 'hidden' }}>
        <Table maxW="100%" variant="striped" color="gray.500" mb="24px">
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <Th
                      pe="10px"
                      py="22px"
                      align="center"
                      borderColor={borderColor}
                      key={header.id}
                      colSpan={header.colSpan}
                    >
                      {header.isPlaceholder ? null : (
                        <Flex
                          {...{
                            className: header.column.getCanSort()
                              ? 'cursor-pointer select-none'
                              : '',
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                          justify="space-between"
                          align="center"
                          fontSize="xs"
                          fontWeight="500"
                          color={textSecondaryColor}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {{
                            asc: '',
                            desc: '',
                          }[header.column.getIsSorted() as string] ?? null}
                        </Flex>
                      )}
                    </Th>
                  );
                })}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row) => {
              return (
                <Tr px="10px" key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <Td
                        key={cell.id}
                        fontSize={{ sm: '14px' }}
                        minW={{ sm: '150px', md: '200px', lg: 'auto' }}
                        borderColor={borderColor}
                        py="27px"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </Td>
                    );
                  })}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Flex>
      <Flex w="100%" justify="space-between" px="20px" pt="10px" pb="5px">
        {/* SET ROW NUMBER */}
        <Text
          fontSize="sm"
          color="gray.500"
          fontWeight="normal"
          mb={{ sm: '24px', md: '0px' }}
        >
          Showing {pageSize * pageIndex + 1} to{' '}
          {pageSize * (pageIndex + 1) <= tableData.length
            ? pageSize * (pageIndex + 1)
            : tableData.length}{' '}
          of {tableData.length} entries
        </Text>
        {/* PAGINATION BUTTONS */}
        <div className="flex items-center gap-2">
          <Stack direction="row" alignSelf="flex-end" spacing="4px" ms="auto">
            <Button
              variant="no-effects"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              transition="all .5s ease"
              w="40px"
              h="40px"
              borderRadius="50%"
              bg="transparent"
              border="1px solid"
              borderColor={useColorModeValue('gray.200', 'white')}
              display={
                pageSize === 5
                  ? 'none'
                  : table.getCanPreviousPage()
                  ? 'flex'
                  : 'none'
              }
              _hover={{
                bg: 'whiteAlpha.100',
                opacity: '0.7',
              }}
            >
              <Icon as={MdChevronLeft} w="16px" h="16px" color={textColor} />
            </Button>
            {createPages(table.getPageCount()).map((pageNumber, index) => {
              return (
                <Button
                  variant="no-effects"
                  transition="all .5s ease"
                  onClick={() => table.setPageIndex(pageNumber - 1)}
                  w="40px"
                  h="40px"
                  borderRadius="50%"
                  bg={pageNumber === pageIndex + 1 ? brandColor : 'transparent'}
                  border={
                    pageNumber === pageIndex + 1
                      ? 'none'
                      : '1px solid lightgray'
                  }
                  _hover={
                    pageNumber === pageIndex + 1
                      ? {
                          opacity: '0.7',
                        }
                      : {
                          bg: 'whiteAlpha.100',
                        }
                  }
                  key={index}
                >
                  <Text
                    fontSize="sm"
                    color={pageNumber === pageIndex + 1 ? '#fff' : textColor}
                  >
                    {pageNumber}
                  </Text>
                </Button>
              );
            })}
            <Button
              variant="no-effects"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              transition="all .5s ease"
              w="40px"
              h="40px"
              borderRadius="50%"
              bg="transparent"
              border="1px solid"
              borderColor={useColorModeValue('gray.200', 'white')}
              display={
                pageSize === 5
                  ? 'none'
                  : table.getCanNextPage()
                  ? 'flex'
                  : 'none'
              }
              _hover={{
                bg: 'whiteAlpha.100',
                opacity: '0.7',
              }}
            >
              <Icon as={MdChevronRight} w="16px" h="16px" color={textColor} />
            </Button>
          </Stack>
        </div>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Role</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to change the role to {selectedRole}?
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => {
                editUserRole(currentUserId, selectedRole);
                onClose();
              }}
            >
              Confirm
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
}
// A debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <SearchBar
      value={value}
      me="10px"
      onChange={(e: any) => setValue(e.target.value)}
      h="44px"
      w="100%"
      mb="30px"
      background="#f8f8f8"
      borderRadius="40px !important"
      placeholder="Search prompt"
    />
  );
}
