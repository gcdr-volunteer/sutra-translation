import type { ActionArgs } from '@remix-run/node';
import type { Team, User, Lang, LangCode, Role, Sutra, CreatedType } from '~/types';
import { created } from 'remix-utils';
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
  Heading,
  Select,
  Button,
  HStack,
  Divider,
} from '@chakra-ui/react';
import { json } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
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
  feedSutra,
  handleUpdateUser,
  // handleSendRegistrationEmail,
} from '~/services/__app/admin';
import { UserForm, TeamForm } from '~/components';
import { LangForm } from '~/components/lang_form';
import { Intent } from '~/types/common';
import { getAllSutraThatFinished } from '~/models/sutra';
import { useEffect, useState } from 'react';
import { logger } from '../../utils';

export const loader = async () => {
  const { teams, users, langs } = await getLoaderData();
  const sutras = await getAllSutraThatFinished();
  return json<{ teams: Team[]; users: User[]; langs: Lang[]; sutras: CreatedType<Sutra>[] }>({
    teams,
    users,
    langs,
    sutras,
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
  working_sutra: string;
  roles: Role['name'];
};
export const action = async ({ request }: ActionArgs) => {
  try {
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
      working_sutra,
    } = entryData as EntryData;
    if (intent && intent === Intent.CREATE_USER) {
      // TODO: we currently only support one selection of role, we will support
      // multiple roles in the future
      await handleCreateNewUser({
        working_sutra,
        username,
        email,
        password,
        team,
        roles: roles as unknown as RoleType[],
        origin_lang,
        target_lang,
        first_login: true,
      });
      // await handleSendRegistrationEmail({ username, email });
      return created({ data: {}, intent: Intent.CREATE_USER });
    }
    if (intent && intent === Intent.UPDATE_USER) {
      const user = {
        ...entryData,
        PK: entryData.PK as string,
        SK: entryData.SK as string,
        ...(entryData.roles ? { roles: [entryData.roles] as RoleType[] } : undefined),
      };
      return handleUpdateUser(user);
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
    if (intent && intent === Intent.CREATE_SUTRA) {
      const { sutra, roll } = entryData as { sutra: string; roll: string };
      await feedSutra({ sutra, roll });
    }
  } catch (error) {
    logger.error('admin.action', 'error', error);
    return json({});
  }
};

export default function AdminRoute() {
  const { users, teams, langs, sutras } = useLoaderData<typeof loader>();
  const usersComp = users?.map((user) => {
    return (
      <UserConfig
        key={user.email}
        user={user}
        userform={<UserForm user={user} teams={teams} langs={langs} sutras={sutras} />}
      />
    );
  });
  return (
    <Box w='100%' overflowY={'scroll'}>
      <Flex p={10} background='secondary.800' flexDir='column' h='100%'>
        <Heading as='h5' size={'md'}>
          Admin
        </Heading>
        <Divider mt={4} mb={4} borderColor={'primary.300'} />
        <Heading as='h5' size={'md'}>
          User Management
        </Heading>
        {usersComp}
        <SutraManagement />
        <AdminActionButtons teams={teams} langs={langs} sutras={sutras} />
      </Flex>
    </Box>
  );
}

interface UserConfigProps {
  user: User;
  userform: React.ReactNode;
}
const UserConfig = (props: UserConfigProps) => {
  const { user, userform } = props;
  const bgColors: Record<RoleType, string> = {
    [RoleType.Admin]: 'pink',
    [RoleType.Leader]: 'lightgreen',
    [RoleType.Editor]: 'lightblue',
    [RoleType.Reviewer]: 'lightyellow',
    [RoleType.Reader]: 'lightcyan',
    [RoleType.Manager]: 'lightpink',
    [RoleType.Assistor]: 'lightsalmon',
    [RoleType.Debug]: 'lightgrey',
  };
  return (
    <Box>
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton _expanded={{ bg: 'primary.800', color: 'white' }}>
              <Box flex='1' textAlign='left'>
                {user.username}
                {user.roles?.map((role) => (
                  <Tag key={role} ml={4} background={bgColors[role]}>
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
    </Box>
  );
};

const SutraManagement = () => {
  return (
    <Box mt={10}>
      <Heading as='h5' size={'md'}>
        Sutra management
      </Heading>
      <Form method='post'>
        <HStack spacing={8}>
          <Select flex={3} placeholder='Select a sutra' name='sutra' colorScheme={'primary'}>
            <option value='T0279'>Avatamsaka Sutra</option>
          </Select>
          <Select flex={3} placeholder='Select a roll' name='roll' colorScheme={'primary'}>
            <option value='1'>Chapter 1</option>
            <option value='2'>Chapter 2</option>
            <option value='3'>Chapter 3</option>
          </Select>
          {/* TODO: make button not selectable when no value selected, plus add spinner when submit */}
          <Button
            flex={1}
            type='submit'
            name='intent'
            value={Intent.CREATE_SUTRA}
            colorScheme={'blue'}
          >
            Sutra Feed
          </Button>
        </HStack>
      </Form>
    </Box>
  );
};
interface AdminActionButtonsProps {
  teams: Team[];
  langs: Lang[];
  sutras: CreatedType<Sutra>[];
}
const AdminActionButtons = ({ teams, langs, sutras }: AdminActionButtonsProps) => {
  const actionData = useActionData<{ errors: { name: string; alias: string }; intent: Intent }>();
  const [errors, setErrors] = useState<{ name: string; alias: string } | undefined>();
  const { isOpen, onToggle } = useDisclosure();
  const { isOpen: isOpenNewUser, onOpen: onOpenNewUser, onClose: onCloseNewUser } = useDisclosure();
  const { isOpen: isOpenNewTeam, onOpen: onOpenNewTeam, onClose: onCloseNewTeam } = useDisclosure();
  const { isOpen: isOpenNewLang, onOpen: onOpenNewLang, onClose: onCloseNewLang } = useDisclosure();

  useEffect(() => {
    if (!isOpenNewLang || !isOpenNewTeam) {
      setErrors({ name: '', alias: '' });
    }
  }, [isOpenNewLang, isOpenNewTeam]);

  useEffect(() => {
    if (actionData?.errors) {
      setErrors(actionData.errors);
    }
    if (actionData?.intent === Intent.CREATE_USER) {
      onCloseNewUser();
    }
    if (actionData?.intent === Intent.CREATE_TEAM) {
      onCloseNewTeam();
    }
    if (actionData?.intent === Intent.CREATE_LANG) {
      onCloseNewLang();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

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
                body={<UserForm teams={teams} langs={langs} isNew={true} sutras={sutras} />}
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
                body={<TeamForm teams={teams} errors={errors} />}
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
                body={<LangForm langs={langs} errors={errors} />}
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
