import {
  Avatar,
  Divider,
  Flex,
  Heading,
  Text,
  VStack,
  Icon,
  HStack,
  Box,
  useTheme,
  Spinner,
  useMediaQuery,
  Circle,
  useBoolean,
} from '@chakra-ui/react';
import { NavLink } from '@remix-run/react';
import { FiHome } from 'react-icons/fi';
import { AiOutlineBook, AiOutlineSetting, AiOutlineRead, AiOutlineTable } from 'react-icons/ai';
import { MdOutlineManageAccounts } from 'react-icons/md';
import { Can } from '~/authorisation';
import { useContext } from 'react';
import { AppContext } from '~/routes/__app';
import { useTransitionState } from '../../hooks';
import { ArrowRightIcon, ArrowLeftIcon } from '@chakra-ui/icons';
export const Sidebar = () => {
  const { isLoading, isSubmitting } = useTransitionState();
  const { currentUser } = useContext(AppContext);
  const {
    colors: { primary, secondary },
  } = useTheme();
  const activeLinkColor = {
    color: primary[300],
  };
  const nonActiveLinkColor = {
    color: secondary[500],
  };

  const [expand, setExpand] = useBoolean(true);

  const [isLargerThan800] = useMediaQuery('(min-width: 800px)');

  if (expand && !isLargerThan800) {
    return (
      <Box w='50px' background='primary.800'>
        <Flex flexDir='column' w='100%' alignItems='center' mb={4} h='100%'>
          <Box onClick={setExpand.toggle} mt={2} cursor={'pointer'}>
            <Circle bg={'primary.300'} size={8}>
              <ArrowRightIcon boxSize={4} color={'secondary.800'} />
            </Circle>
          </Box>
          <Box flexGrow={1} />
          <Flex mt={4} alignItems='center' flexDir='row' justifyContent='center' h='50px'>
            <Avatar
              size='sm'
              name={currentUser?.username ?? 'U'}
              src='https://bit.ly/broken-link'
            />
          </Flex>
        </Flex>
      </Box>
    );
  }
  return (
    <Box w='250px' background='primary.800'>
      <Flex
        px='5%'
        pos={'sticky'}
        top='0'
        left='0'
        h='100vh'
        w='250px'
        flexDir='column'
        justifyContent='space-between'
        boxShadow='0 4px 12px 0 rgba(0, 0, 0, 0.05)'
      >
        <VStack spacing={4}>
          {/* Logo section */}
          <VStack pt={6} w='100%'>
            <NavLink to='.' style={{ textAlign: 'center', marginBottom: '0.2rem' }}>
              <Text as='b' fontSize={'3xl'} color={'secondary.300'}>
                {isLoading || isSubmitting ? <Spinner /> : null}
                Kumārajīva
              </Text>
            </NavLink>
            <Divider borderColor='primary.300' />
          </VStack>
          {/* menu section */}
          <Flex w='70%' flexDir={'column'} justifyContent={'space-between'}>
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
                to='dashboard'
                style={({ isActive }) => (isActive ? activeLinkColor : nonActiveLinkColor)}
              >
                <HStack justifyContent={'flex-start'}>
                  <Icon as={FiHome} />
                  <Text as='b'>Home</Text>
                </HStack>
              </NavLink>
            </Box>
            <Can I='Read' this='Translation'>
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
                  to='tripitaka'
                  style={({ isActive }) => (isActive ? activeLinkColor : nonActiveLinkColor)}
                >
                  <HStack justifyContent={'flex-start'}>
                    <Icon as={AiOutlineBook} />
                    <Text as='b'>Translation</Text>
                  </HStack>
                </NavLink>
              </Box>
            </Can>
            {/* <Box
              px={6}
              py={2}
              _hover={{
                color: 'secondary.500',
                background: 'whiteAlpha.300',
                borderRadius: 8,
              }}
            >
              <NavLink
                to='sutra'
                style={({ isActive }) => (isActive ? activeLinkColor : nonActiveLinkColor)}
              >
                <HStack justifyContent={'flex-start'}>
                  <Icon as={AiOutlineTranslation} />
                  <Text as='b' w='100%'>
                    Sutra
                  </Text>
                </HStack>
              </NavLink>
            </Box> */}
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
                to='glossary'
                style={({ isActive }) => (isActive ? activeLinkColor : nonActiveLinkColor)}
              >
                <HStack justifyContent={'flex-start'}>
                  <Icon as={AiOutlineTable} />
                  <Text as='b'>Glossary</Text>
                </HStack>
              </NavLink>
            </Box>
            <Can I='Read' this='Reference'>
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
                  to='reference'
                  style={({ isActive }) => (isActive ? activeLinkColor : nonActiveLinkColor)}
                >
                  <HStack justifyContent={'flex-start'}>
                    <Icon as={AiOutlineRead} />
                    <Text as='b'>Reference</Text>
                  </HStack>
                </NavLink>
              </Box>
            </Can>
            <Can I='Read' this='Management'>
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
                  to='management'
                  style={({ isActive }) => (isActive ? activeLinkColor : nonActiveLinkColor)}
                >
                  <HStack justifyContent={'flex-start'}>
                    <Icon as={MdOutlineManageAccounts} />
                    <Text as='b'>Management</Text>
                  </HStack>
                </NavLink>
              </Box>
            </Can>
            <Can I='Read' this='Administration'>
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
                  to='admin'
                  style={({ isActive }) => (isActive ? activeLinkColor : nonActiveLinkColor)}
                >
                  <HStack justifyContent={'flex-start'}>
                    <Icon as={AiOutlineSetting} />
                    <Text as='b'>Admin</Text>
                  </HStack>
                </NavLink>
              </Box>
            </Can>
          </Flex>
        </VStack>
        {/* user profile section */}
        <Flex flexDir='column' w='100%' alignItems='center' mb={4}>
          <Divider borderColor={'primary.300'} />
          <Flex mt={4} alignItems='center' flexDir='row' w='100%' justifyContent='space-evenly'>
            <Flex flexDir='row'>
              <Avatar
                mr={2}
                size='sm'
                name={currentUser?.username ?? 'U'}
                src='https://bit.ly/broken-link'
              />
              <NavLink to='setting'>
                <Heading as='h3' size='sm' color='secondary.500'>
                  {currentUser?.username}
                </Heading>
                <Text color='secondary.500'>{currentUser?.roles[0]}</Text>
              </NavLink>
            </Flex>
            {!isLargerThan800 ? (
              <Box onClick={setExpand.toggle}>
                <ArrowLeftIcon boxSize={4} color={'secondary.800'} />
              </Box>
            ) : undefined}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};
