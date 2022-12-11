import {
  Flex,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Tag,
  FormControl,
  FormLabel,
  Input,
  useBoolean,
  Select,
  useDisclosure,
  IconButton,
  Fade,
  VStack,
  Tooltip,
  SimpleGrid,
} from '@chakra-ui/react';
import { json, LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { assertAuthUser } from '~/auth.server';
import { Team, roles, User, langs } from '~/types/user';
import { EditIcon } from '@chakra-ui/icons';
import { RiUser2Line, RiTeamLine } from 'react-icons/ri';
import { FaLanguage } from 'react-icons/fa';
import { FormModal } from '~/components/common';
export const loader = async () => {
  return json<{ teams: string[]; roles: string[]; users: User[]; langs: string[] }>({
    teams: Object.values(Team),
    roles: roles as unknown as string[],
    langs: langs as unknown as string[],
    users: [
      {
        username: 'Terry Pan',
        roles: ['Viewer'],
        email: 'pantaotao@icloud.com',
        origin_lang: 'ZH',
        target_lang: 'EN',
        team: Team.TEAM0001,
        first_login: false,
      },
      {
        username: 'Tao Pan',
        roles: ['Admin'],
        email: 'pttdev123@gmail.com',
        origin_lang: 'ZH',
        target_lang: 'EN',
        team: Team.TEAM0002,
        first_login: false,
      },
    ],
  });
};
export default function TripitakaRoute() {
  const { users, teams, roles, langs } = useLoaderData<typeof loader>();
  const usersComp = users?.map((user) => {
    return (
      <UserConfig
        key={user.email}
        user={user}
        userform={<UserForm {...user} teams={teams} langs={langs} roless={roles} />}
      />
    );
  });
  return (
    <Flex p={10} background="secondary.800" w="100%" flexDir="column">
      {usersComp}
      <AdminActionButtons teams={teams} roles={roles} langs={langs} />
    </Flex>
  );
}

interface UserConfigProps {
  user: User;
  userform: React.ReactNode;
}
const UserConfig = (props: UserConfigProps) => {
  const { user, userform } = props;
  return (
    <Accordion allowToggle>
      <AccordionItem>
        <h2>
          <AccordionButton _expanded={{ bg: 'primary.800', color: 'white' }}>
            <Box flex="1" textAlign="left">
              {user.username}
              {user.roles?.map((role) => (
                <Tag key={role} ml={4} background={role === 'Admin' ? 'pink' : 'lightgreen'}>
                  {role}
                </Tag>
              ))}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel background={'secondary.500'}>{userform}</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

interface UserFormProps extends User {
  teams: string[];
  langs: string[];
  roless: string[];
  isNew?: boolean;
}

interface AdminActionButtonsProps {
  roles: string[];
  teams: string[];
  langs: string[];
}
const AdminActionButtons = (props: AdminActionButtonsProps) => {
  const { roles, teams, langs } = props;
  const { isOpen, onToggle } = useDisclosure();
  const { isOpen: isOpenNewUser, onOpen: onOpenNewUser, onClose: onCloseNewUser } = useDisclosure();
  const user: User = {
    username: '',
    email: '',
    roles: ['Viewer'],
    team: Team.TEAM0001,
    origin_lang: 'ZH',
    target_lang: 'EN',
    first_login: false,
  };
  return (
    <Box pos={'fixed'} right={8} bottom={8}>
      <Fade in={isOpen}>
        <VStack spacing={4} mb={4}>
          <Tooltip label="add a new user" placement="left">
            <span>
              <IconButton
                colorScheme={'iconButton'}
                borderRadius={'50%'}
                w={12}
                h={12}
                aria-label="open admin edit buttons"
                icon={<RiUser2Line />}
                onClick={onOpenNewUser}
              />
              <FormModal
                header="Add a New User"
                body={
                  <UserForm {...user} teams={teams} roless={roles} langs={langs} isNew={true} />
                }
                isOpen={isOpenNewUser}
                onClose={onCloseNewUser}
                name="newuser"
              />
            </span>
          </Tooltip>
          <Tooltip label="add a new team" placement="left">
            <IconButton
              colorScheme={'iconButton'}
              borderRadius={'50%'}
              w={12}
              h={12}
              aria-label="open admin edit buttons"
              icon={<RiTeamLine />}
            />
          </Tooltip>
          <Tooltip label="add a new language" placement="left">
            <IconButton
              colorScheme={'iconButton'}
              borderRadius={'50%'}
              w={12}
              h={12}
              aria-label="open admin edit buttons"
              icon={<FaLanguage />}
            />
          </Tooltip>
        </VStack>
      </Fade>
      <IconButton
        colorScheme={'iconButton'}
        borderRadius={'50%'}
        w={12}
        h={12}
        aria-label="open admin edit buttons"
        icon={<EditIcon />}
        onClick={onToggle}
      />
    </Box>
  );
};

const UserForm = (props: UserFormProps) => {
  const [toggleEdit, setToggleEdit] = useBoolean(true);
  const { username, email, team, teams, langs, origin_lang, target_lang, roles, roless, isNew } =
    props;
  return (
    <form method="post">
      <SimpleGrid columns={isNew ? 2 : 3} spacing={4}>
        <FormControl>
          <FormLabel>User name:</FormLabel>
          <Input type="text" value={username} onChange={() => {}} name="username" />
        </FormControl>
        {isNew ? (
          <FormControl>
            <FormLabel>Password: </FormLabel>
            <Input type="text" value={''} onChange={() => {}} name="password" />
          </FormControl>
        ) : null}
        <FormControl>
          <FormLabel>Email:</FormLabel>
          <Input type="email" value={email} onChange={() => {}} name="email" />
        </FormControl>
        <FormControl>
          <FormLabel>Team:</FormLabel>
          <Select value={team} onChange={() => {}}>
            {teams?.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Role:</FormLabel>
          <Select value={roles[0]} onChange={() => {}}>
            {roless?.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Source Language:</FormLabel>
          <Select value={origin_lang} onChange={() => {}}>
            {langs?.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Target Language:</FormLabel>
          <Select value={target_lang} onChange={() => {}}>
            {langs?.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </Select>
        </FormControl>
      </SimpleGrid>
    </form>
  );
};
