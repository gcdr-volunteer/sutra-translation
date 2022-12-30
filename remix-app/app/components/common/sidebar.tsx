import {
  Avatar,
  Divider,
  Flex,
  Heading,
  IconButton,
  Text,
  useBoolean,
  VStack,
  Icon,
  HStack,
  Box,
  useTheme,
} from '@chakra-ui/react';
import { ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons';
import { NavLink } from '@remix-run/react';
import { FiHome } from 'react-icons/fi';
import { AiOutlineBook, AiOutlineTranslation, AiOutlineSetting } from 'react-icons/ai';
import { Can } from '~/authorisation';
export const Sidebar = () => {
  const [toggle, setToggle] = useBoolean(true);
  const {
    colors: { primary, secondary },
  } = useTheme();
  const activeLinkColor = {
    color: primary[300],
  };
  const nonActiveLinkColor = {
    color: secondary[500],
  };
  if (toggle) {
    return (
      <Box w="250px" background="primary.800">
        <Flex
          px="5%"
          pos={'sticky'}
          top="0"
          left="0"
          h="100vh"
          w="250px"
          flexDir="column"
          justifyContent="space-between"
          boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.05)"
        >
          <VStack spacing={4}>
            {/* Logo section */}
            <VStack pt={6} w="100%">
              <NavLink to="." style={{ textAlign: 'center', marginBottom: '0.2rem' }}>
                <Text as="b" fontSize={'3xl'} color={'secondary.300'}>
                  Kumārajīva
                </Text>
              </NavLink>
              <Divider borderColor="primary.300" />
            </VStack>
            {/* menu section */}
            <Flex w="70%" flexDir={'column'} justifyContent={'space-between'}>
              <Box
                px={6}
                py={2}
                _hover={{
                  color: 'secondary.500',
                  background: 'whiteAlpha.300',
                  borderRadius: 8,
                }}
              >
                <NavLink
                  to="dashboard"
                  style={({ isActive }) => (isActive ? activeLinkColor : nonActiveLinkColor)}
                >
                  <HStack justifyContent={'flex-start'}>
                    <Icon as={FiHome} />
                    <Text as="b">Home</Text>
                  </HStack>
                </NavLink>
              </Box>
              <Box
                px={6}
                py={2}
                _hover={{
                  color: 'secondary.500',
                  background: 'whiteAlpha.300',
                  borderRadius: 8,
                }}
              >
                <NavLink
                  to="tripitaka"
                  style={({ isActive }) => (isActive ? activeLinkColor : nonActiveLinkColor)}
                >
                  <HStack justifyContent={'flex-start'}>
                    <Icon as={AiOutlineBook} />
                    <Text as="b">Sutra</Text>
                  </HStack>
                </NavLink>
              </Box>
              <Box
                px={6}
                py={2}
                _hover={{
                  color: 'secondary.500',
                  background: 'whiteAlpha.300',
                  borderRadius: 8,
                }}
              >
                <NavLink
                  to="translation"
                  style={({ isActive }) => (isActive ? activeLinkColor : nonActiveLinkColor)}
                >
                  <HStack justifyContent={'flex-start'}>
                    <Icon as={AiOutlineTranslation} />
                    <Text as="b">Translation</Text>
                  </HStack>
                </NavLink>
              </Box>
              <Can I="Read" this="Administration">
                <Box
                  px={6}
                  py={2}
                  _hover={{
                    color: 'secondary.500',
                    background: 'whiteAlpha.300',
                    borderRadius: 8,
                  }}
                >
                  <NavLink
                    to="admin"
                    style={({ isActive }) => (isActive ? activeLinkColor : nonActiveLinkColor)}
                  >
                    <HStack justifyContent={'flex-start'}>
                      <Icon as={AiOutlineSetting} />
                      <Text as="b">Admin</Text>
                    </HStack>
                  </NavLink>
                </Box>
              </Can>
            </Flex>
          </VStack>
          {/* user profile section */}
          <Flex flexDir="column" w="100%" alignItems="center" mb={4}>
            <Divider borderColor={'primary.300'} />
            <Flex mt={4} alignItems="center" flexDir="row" w="100%" justifyContent="space-evenly">
              <Flex flexDir="row" ml={4}>
                <Avatar mr={2} size="sm" name="Terry Pan" src="https://bit.ly/broken-link" />
                <NavLink to="setting">
                  <Heading as="h3" size="sm" color="secondary.500">
                    Terry Pan
                  </Heading>
                  <Text color="secondary.500">Admin</Text>
                </NavLink>
              </Flex>
              <IconButton
                background="none"
                _hover={{ background: 'none' }}
                aria-label="menu-bar"
                icon={<ArrowLeftIcon color="white" />}
                onClick={setToggle.toggle}
              />
            </Flex>
          </Flex>
        </Flex>
      </Box>
    );
  } else {
    return (
      <IconButton
        pos="fixed"
        bottom={8}
        left={8}
        w={12}
        h={12}
        colorScheme={'iconButton'}
        aria-label="sidebar-menu-button"
        isRound
        icon={<ArrowRightIcon />}
        onClick={setToggle.toggle}
      />
    );
  }
};
