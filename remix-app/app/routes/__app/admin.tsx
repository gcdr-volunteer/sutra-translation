import type { ActionArgs } from '@remix-run/node';
import type { Team, User, Lang, LangCode, Role } from '~/types';
import {
  Flex,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Tag,
  useDisclosure,
  IconButton,
  Fade,
  VStack,
  Tooltip,
} from '@chakra-ui/react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { EditIcon } from '@chakra-ui/icons';
import { RiUser2Line, RiTeamLine } from 'react-icons/ri';
import { FaLanguage } from 'react-icons/fa';
import { FormModal } from '~/components/common';
import { RoleType } from '~/types/role';
import {
  handleCreateNewLang,
  handleCreateNewTeam,
  handleCreateNewUser,
  getLoaderData,
} from '~/services/__app/admin';
import { UserForm, TeamForm } from '~/components';
import { LangForm } from '~/components/lang_form';
import { Intent } from '~/types/common';

export const loader = async () => {
  const { teams, users, langs } = await getLoaderData();
  return json<{ teams: Team[]; users: User[]; langs: Lang[] }>({
    teams,
    users,
    langs,
  });
};

type EntryData = {
  intent: string;
  team_name: string;
  team_alias: string;
  lang_name: LangCode;
  lang_alias: string;
  username: string;
  email: string;
  password: string;
  team: Team['name'];
  origin_lang: LangCode;
  target_lang: LangCode;
  roles: Role['name'];
};
export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const entryData = Object.fromEntries(formData.entries());
  const {
    intent,
    team_name,
    team_alias,
    lang_name,
    lang_alias,
    username,
    email,
    password,
    team,
    roles,
    origin_lang,
    target_lang,
  } = entryData as EntryData;
  if (intent && intent === Intent.CREATE_USER) {
    // TODO: we currently only support one selection of role, we will support
    // multiple roles in the future
    return await handleCreateNewUser({
      username,
      email,
      password,
      team,
      roles: roles as unknown as RoleType[],
      origin_lang,
      target_lang,
      first_login: true,
    });
  }
  if (intent && intent === Intent.CREATE_TEAM) {
    return await handleCreateNewTeam({ name: team_name as string, alias: team_alias as string });
  }
  if (intent && intent === Intent.CREATE_LANG) {
    return await handleCreateNewLang({
      name: lang_name,
      alias: lang_alias,
    });
  }
  return json({});
};

export default function AdminRoute() {
  const { users, teams, langs } = useLoaderData<typeof loader>();
  const usersComp = users?.map((user) => {
    return (
      <UserConfig
        key={user.email}
        user={user}
        userform={<UserForm user={user} teams={teams} langs={langs} />}
      />
    );
  });
  return (
    <Flex p={10} background='secondary.800' w='100%' flexDir='column'>
      {usersComp}
      <AdminActionButtons teams={teams} langs={langs} />
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
            <Box flex='1' textAlign='left'>
              {user.username}
              {user.roles?.map((role) => (
                <Tag key={role} ml={4} background={role === RoleType.Admin ? 'pink' : 'lightgreen'}>
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

interface AdminActionButtonsProps {
  teams: Team[];
  langs: Lang[];
}
const AdminActionButtons = (props: AdminActionButtonsProps) => {
  const { teams, langs } = props;
  const { isOpen, onToggle } = useDisclosure();
  const { isOpen: isOpenNewUser, onOpen: onOpenNewUser, onClose: onCloseNewUser } = useDisclosure();
  const { isOpen: isOpenNewTeam, onOpen: onOpenNewTeam, onClose: onCloseNewTeam } = useDisclosure();
  const { isOpen: isOpenNewLang, onOpen: onOpenNewLang, onClose: onCloseNewLang } = useDisclosure();

  return (
    <Box pos={'fixed'} right={8} bottom={8}>
      <Fade in={isOpen}>
        <VStack spacing={4} mb={4}>
          <Tooltip label='add a new user' placement='left'>
            <span>
              <IconButton
                colorScheme={'iconButton'}
                borderRadius={'50%'}
                w={12}
                h={12}
                aria-label='open admin edit buttons'
                icon={<RiUser2Line />}
                onClick={onOpenNewUser}
              />
              <FormModal
                header='Add a New User'
                body={<UserForm teams={teams} langs={langs} isNew={true} />}
                isOpen={isOpenNewUser}
                onClose={onCloseNewUser}
                value={Intent.CREATE_USER}
              />
            </span>
          </Tooltip>
          <Tooltip label='add a new team' placement='left'>
            <span>
              <IconButton
                colorScheme={'iconButton'}
                borderRadius={'50%'}
                w={12}
                h={12}
                aria-label='open admin edit buttons'
                icon={<RiTeamLine />}
                onClick={onOpenNewTeam}
              />
              <FormModal
                header='Add a New Team'
                body={<TeamForm teams={teams} onClose={onCloseNewTeam} />}
                isOpen={isOpenNewTeam}
                onClose={onCloseNewTeam}
                value={Intent.CREATE_TEAM}
              />
            </span>
          </Tooltip>
          <Tooltip label='add a new language' placement='left'>
            <span>
              <IconButton
                colorScheme={'iconButton'}
                borderRadius={'50%'}
                w={12}
                h={12}
                aria-label='open admin edit buttons'
                icon={<FaLanguage />}
                onClick={onOpenNewLang}
              />
              <FormModal
                header='Add a New Language'
                body={<LangForm langs={langs} onClose={onCloseNewLang} />}
                isOpen={isOpenNewLang}
                onClose={onCloseNewLang}
                value={Intent.CREATE_LANG}
              />
            </span>
          </Tooltip>
        </VStack>
      </Fade>
      <IconButton
        colorScheme={'iconButton'}
        borderRadius={'50%'}
        w={12}
        h={12}
        aria-label='open admin edit buttons'
        icon={<EditIcon />}
        onClick={onToggle}
      />
    </Box>
  );
};
