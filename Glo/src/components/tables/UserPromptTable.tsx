'use client';
/* eslint-disable */

import {
  Badge,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
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
  Textarea,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  CloseButton,
} from '@chakra-ui/react';
import Card from '@/components/card/Card';
import { MdChevronRight, MdChevronLeft } from 'react-icons/md';
import * as React from 'react';
import { SearchBar } from '@/components/search';
import { useAuth } from '@/providers/auth/AuthProvider';
import { AiOutlineClose } from 'react-icons/ai';

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
  id: number;
  content: string;
  category: string;
  words: string;
  userEmail: string;
  userId: string;
};

export default function SearchUserPrompt(props: { tableData: RowObj[] }) {
  const { currentUser } = useAuth();
  const { tableData } = props;
  const textColor = useColorModeValue('navy.700', 'white');
  const textSecondaryColor = useColorModeValue('gray.500', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [data, setData] = React.useState<RowObj[]>([]);

  const modalDisclosure = useDisclosure();
  const alertDisclosure = useDisclosure();

  const [promptContent, setPromptContent] = React.useState('');
  const [promptCategory, setPromptCategory] = React.useState('');

  const cancelRef = React.useRef();

  const [globalFilter, setGlobalFilter] = React.useState('');
  const columnHelper = createColumnHelper<RowObj>();
  const columns = [
    columnHelper.accessor('id', {
      id: 'id',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize="xs"
          fontWeight="500"
          color={textSecondaryColor}
        >
          ID
        </Text>
      ),
      cell: (info: any) => (
        <Text color={textColor} fontSize="md" fontWeight="500">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('category', {
      id: 'category',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize="xs"
          fontWeight="500"
          color={textSecondaryColor}
        >
          Category
        </Text>
      ),
      cell: (info: any) => (
        <Text color={textColor} fontSize="md" fontWeight="500">
          {/* {info.getValue().length < 31
            ? info.getValue().concat('...')
            : info.getValue().slice(0, 5000).concat('...')} */}
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('content', {
      id: 'content',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize="xs"
          fontWeight="500"
          color={textSecondaryColor}
        >
          CONTENT
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="md" fontWeight="500">
          {/* {info.getValue().length < 31
            ? info.getValue().concat('...')
            : info.getValue().slice(0, 5000).concat('...')} */}
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('userEmail', {
      id: 'userEmail',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize="xs"
          fontWeight="500"
          color={textSecondaryColor}
        >
          Created by User
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="md" fontWeight="500">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('', {
      id: 'delete',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize="xs"
          fontWeight="500"
          color={textSecondaryColor}
        >
          Delete
        </Text>
      ),
      cell: (info) => {
        const prompt = info.row.original;
        const handleDeleteClick = async () => {
          const response = await fetch('/api/prisma/deleteUserPrompt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: prompt.id,
              userEmail: currentUser?.email,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to delete prompt');
          }

          //Remove prompt from list
          setData((prevData) => prevData.filter((p) => p.id !== prompt.id));
        };
        return (
          <>
            <Button
              onClick={handleDeleteClick}
              colorScheme="red"
              variant="ghost"
            >
              <Icon as={AiOutlineClose} />
            </Button>
            <AlertDialog
              isOpen={alertDisclosure.isOpen}
              leastDestructiveRef={cancelRef}
              onClose={alertDisclosure.onClose}
            >
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader fontSize="lg" fontWeight="bold">
                    Delete Prompt
                  </AlertDialogHeader>

                  <AlertDialogBody>
                    Are you sure you want to delete this default prompt? You
                    can't undo this action afterwards.
                  </AlertDialogBody>

                  <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={alertDisclosure.onClose}>
                      Cancel
                    </Button>
                    <Button
                      colorScheme="red"
                      onClick={async () => {
                        //Just delete it
                        const response = await fetch(
                          '/api/prisma/deleteUserPrompt',
                          {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              id: prompt.id,
                              userEmail: currentUser?.email,
                            }),
                          },
                        );

                        if (!response.ok) {
                          throw new Error('Failed to delete prompt');
                        }

                        //Remove prompt from list
                        setData((prevData) =>
                          prevData.filter((p) => p.id !== prompt.id),
                        );

                        alertDisclosure.onClose();
                      }}
                      ml={3}
                    >
                      Delete
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>
          </>
        );
      },
    }),
  ];

  React.useEffect(() => {
    setData([...tableData]);
  }, [tableData]);

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

  async function createPrompt(
    content: string,
    category: string,
    userId: string,
  ) {
    if (!userId) {
      console.error('NO userId');
    }
    const response = await fetch('/api/prisma/createUserPrompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        category,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create prompt');
    }

    return response.json();
  }

  const handleSave = async () => {
    try {
      if (currentUser) {
        const newPrompt = await createPrompt(
          promptContent,
          promptCategory,
          currentUser?.id,
        );

        // add missing email from ret obj
        newPrompt.userEmail = currentUser.email;

        setData((prevData) => [...prevData, newPrompt]);
        modalDisclosure.onClose();

        setPromptCategory('');
        setPromptContent('');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Modal isOpen={modalDisclosure.isOpen} onClose={modalDisclosure.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create new prompt</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Prompt</FormLabel>
              <Textarea
                value={promptContent}
                onChange={(e) => setPromptContent(e.target.value)}
              />
              <FormLabel>Category</FormLabel>
              <Textarea
                value={promptCategory}
                onChange={(e) => setPromptCategory(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSave}>
              Save
            </Button>
            <Button variant="ghost" onClick={modalDisclosure.onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
        <Flex
          maxW="100%"
          overflowX={{ base: 'scroll', lg: 'hidden' }}
          my="10px"
          justifyContent="center"
          background="#f4f7fe"
        >
          <Button
            onClick={modalDisclosure.onOpen}
            py="20px"
            px="16px"
            fontSize="md"
            variant="primary"
            borderRadius="45px"
            w={{ base: '50%' }}
            my="15px"
            h="54px"
            _hover={{
              boxShadow:
                '0px 21px 27px -10px rgba(96, 60, 255, 0.48) !important',
              bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%) !important',
              _disabled: {
                bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)',
              },
            }}
          >
            Add Prompt
          </Button>
        </Flex>
        <Flex
          maxW="100%"
          overflowX={{ base: 'scroll', lg: 'hidden' }}
          mt="30px"
        >
          <Table maxW="100%" variant="striped" color="gray.500" mb="24px">
            <Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <Th
                        pe="10px"
                        py="22px"
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
                  <Tr px="20px" key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <Td
                          key={cell.id}
                          fontSize={{ sm: '14px' }}
                          minW={{ sm: '150px', md: '200px', lg: 'auto' }}
                          borderColor={borderColor}
                          py="57px"
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
                    bg={
                      pageNumber === pageIndex + 1 ? brandColor : 'transparent'
                    }
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
      </Card>
    </>
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
      background={'#f8f8f8'}
      borderRadius="40px !important"
      placeholder="Search prompt"
    />
  );
}
