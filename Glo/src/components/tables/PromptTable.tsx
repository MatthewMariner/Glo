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
  useToast,
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
  isDefault: boolean;
  content: string;
  words: string;
  userEmail: string;
  userId: string;
};

export default function SearchPrompt(props: { tableData: RowObj[] }) {
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

  const toast = useToast();

  const modalDisclosure = useDisclosure();
  const alertDisclosure = useDisclosure();

  const [promptContent, setPromptContent] = React.useState('');
  const [isDefaultPrompt, setIsDefaultPrompt] = React.useState(false);
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
    columnHelper.accessor('isDefault', {
      id: 'isDefault',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize="xs"
          fontWeight="500"
          color={textSecondaryColor}
        >
          DEFAULT
        </Text>
      ),
      cell: (info: any) => (
        <Checkbox
          colorScheme="brandScheme"
          me="10px"
          isChecked={info.getValue()}
          onChange={() =>
            handleCheckboxClick(info.row.original.id, !info.getValue())
          }
          isDisabled={data.length === 1 && info.getValue()}
        />
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
          if (prompt.isDefault) {
            alertDisclosure.onOpen();
          } else {
            //Just delete it
            const response = await fetch('/api/prisma/deletePrompt', {
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
          }
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
                    Are you sure you want to delete THE DEFAULT prompt? You
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
                          '/api/prisma/deletePrompt',
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
    isDefault: boolean,
    userId: string,
  ) {
    if (!userId) {
      console.error('NO userId');
      toast({
        title: 'Error',
        description: 'NO userId',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    const response = await fetch('/api/prisma/createPrompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        content,
        isDefault,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create prompt, check console');
    }

    return response.json();
  }

  async function handleCheckboxClick(
    promptId: number,
    newDefaultStatus: boolean,
  ) {
    if (newDefaultStatus) {
      const oldDefaultPrompt = data.find((prompt) => prompt.isDefault);

      if (oldDefaultPrompt) {
        await toggleDefaultPrompt(oldDefaultPrompt.id, false);
      }
    }

    toggleDefaultPrompt(promptId, newDefaultStatus);
  }

  async function toggleDefaultPrompt(
    promptId: number,
    newDefaultStatus: boolean,
  ) {
    const response = await fetch('/api/prisma/updatePrompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: promptId,
        isDefault: newDefaultStatus,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update prompt default status');
    }

    // Update the prompt's status in the local state
    setData((prevData) => {
      return prevData.map((prompt) => {
        if (prompt.id === promptId) {
          return { ...prompt, isDefault: newDefaultStatus };
        } else if (newDefaultStatus) {
          // ensuring only one prompt can be default
          return { ...prompt, isDefault: false };
        }
        return prompt;
      });
    });
  }

  const handleSave = async () => {
    try {
      if (currentUser) {
        if (isDefaultPrompt) {
          // Check if there's already a default prompt
          const oldDefaultPrompt = data.find((prompt) => prompt.isDefault);

          if (oldDefaultPrompt) {
            // If there is, set its isDefault to false
            await toggleDefaultPrompt(oldDefaultPrompt.id, false);
          }
        }

        const newPrompt = await createPrompt(
          promptContent,
          isDefaultPrompt,
          currentUser?.id,
        );

        // add missing email from ret obj
        newPrompt.userEmail = currentUser.email;
        // manually set isDefault property of new prompt
        newPrompt.isDefault = isDefaultPrompt;

        setData((prevData) => [...prevData, newPrompt]);
        modalDisclosure.onClose();
        // Reset the state of isDefaultPrompt and promptContent
        setIsDefaultPrompt(false);
        setPromptContent('');
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: `${error}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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
            </FormControl>
            <Checkbox
              isChecked={isDefaultPrompt}
              onChange={(e) => setIsDefaultPrompt(e.target.checked)}
            >
              Set as default prompt
            </Checkbox>
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
