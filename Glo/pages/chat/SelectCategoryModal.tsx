'use client';

import {
  Button,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  Select,
  Heading,
  UnorderedList,
  ListItem,
  Box,
  ScaleFade,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';

type UserCategoriesWithPrompts = Record<
  string,
  { id: number; content: string }[]
>;

type SelectCategoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string, id: number) => void;
};

export default function SelectCategoryModal({
  isOpen,
  onClose,
  onSelect,
}: SelectCategoryModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [userCategoriesWithUserPrompts, setUserCategoriesWithUserPrompts] =
    useState<UserCategoriesWithPrompts>({});
  const [displayCategories, setDisplayCategories] =
    useState<UserCategoriesWithPrompts>(userCategoriesWithUserPrompts);
  // Define a state for the filtered categories
  const [filteredCategories, setFilteredCategories] =
    useState<UserCategoriesWithPrompts>(userCategoriesWithUserPrompts);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/prisma/getUserPrompts');
        const data = await res.json();
        const promptsData: UserCategoriesWithPrompts = data.reduce(
          (acc, curr) => {
            if (!acc[curr.category]) {
              acc[curr.category] = [];
            }
            acc[curr.category].push({ id: curr.id, content: curr.content });
            return acc;
          },
          {} as UserCategoriesWithPrompts,
        );

        setUserCategoriesWithUserPrompts(promptsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch user prompts:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter the categories on the basis of the filter
  useEffect(() => {
    const newFilteredCategories = Object.keys(userCategoriesWithUserPrompts)
      .filter((category) => filter === '' || category.includes(filter))
      .reduce((obj, key) => {
        obj[key] = userCategoriesWithUserPrompts[key];
        return obj;
      }, {} as UserCategoriesWithPrompts);

    setFilteredCategories(newFilteredCategories);
  }, [filter, userCategoriesWithUserPrompts]);

  // Filter the prompts on the basis of the search term
  useEffect(() => {
    const newDisplayCategories = Object.keys(filteredCategories).reduce(
      (obj, category) => {
        const filteredPrompts = filteredCategories[category].filter((prompt) =>
          prompt.content.toLowerCase().includes(search.toLowerCase()),
        );

        // If the category has some prompts after the filtering, add it to the result
        if (filteredPrompts.length > 0) {
          obj[category] = filteredPrompts;
        }

        return obj;
      },
      {} as UserCategoriesWithPrompts,
    );

    setDisplayCategories(newDisplayCategories);
  }, [search, filteredCategories]);

  const handleSelect = (prompt: string, id: number) => {
    onSelect(prompt, id);
    onClose();
  };

  const renderPrompts = () => {
    return Object.keys(displayCategories).map((category, index) => {
      const prompts =
        displayCategories[category as keyof UserCategoriesWithPrompts];
      if (prompts.length > 0) {
        return (
          <ScaleFade initialScale={0.9} in={isOpen} key={category}>
            <Box>
              <Flex
                padding={
                  index === 0 ? '0px 0px 10px 25px' : '10px 0px 10px 25px'
                }
              >
                <Box
                  width="3px"
                  height="19px"
                  backgroundColor={index % 2 === 0 ? '#296FFA' : '#FA8929'}
                  marginBottom="2px"
                  marginRight={'10px'}
                />
                <Heading
                  size="md"
                  color="#111828"
                  fontWeight="bold"
                  fontSize="16px"
                  lineHeight="19px"
                >
                  {category}
                </Heading>
              </Flex>
              <UnorderedList styleType={'none'} margin="0">
                {prompts.map((prompt, index) => (
                  <ScaleFade initialScale={0.9} in={isOpen} key={prompt.id}>
                    <ListItem
                      onClick={() => handleSelect(prompt.content, prompt.id)}
                      _hover={{ backgroundColor: '#f8f8f8' }}
                      backgroundColor={
                        index % 2 === 0 ? '#fbfbfb' : 'transparent'
                      }
                      color="#111828"
                      fontWeight="500"
                      fontSize="18px"
                      lineHeight="24px"
                      cursor={'pointer'}
                      padding={'10px 0px 10px 40px'}
                    >
                      {prompt.content}
                    </ListItem>
                  </ScaleFade>
                ))}
              </UnorderedList>
            </Box>
          </ScaleFade>
        );
      }
      return null;
    });
  };

  return (
    <>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ScaleFade initialScale={0.9} in={isOpen}>
          <Modal
            isOpen={isOpen}
            onClose={onClose}
            motionPreset="slideInBottom"
            scrollBehavior="inside"
            size={'4xl'}
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                <Flex>
                  <Input
                    placeholder="Search"
                    mb={4}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    width="75%"
                    borderLeftRadius={'23px'}
                    borderRightRadius={'0px'}
                  />
                  <Select
                    placeholder="Filter by category"
                    mb={4}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    width="25%"
                    borderRightRadius={'23px'}
                    borderLeft={'none'}
                    borderLeftRadius={'0px'}
                  >
                    {Object.keys(userCategoriesWithUserPrompts).map(
                      (category, index) => (
                        <option key={index} value={category}>
                          {category}
                        </option>
                      ),
                    )}
                  </Select>
                </Flex>
              </ModalHeader>
              <ModalBody padding={0}>{renderPrompts()}</ModalBody>
            </ModalContent>
          </Modal>
        </ScaleFade>
      )}
    </>
  );
}
