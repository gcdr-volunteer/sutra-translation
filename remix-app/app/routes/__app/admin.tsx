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
import { json, ActionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { User } from '~/types/user';
import { EditIcon } from '@chakra-ui/icons';
import { RiUser2Line, RiTeamLine } from 'react-icons/ri';
import { FaLanguage } from 'react-icons/fa';
import { FormModal } from '~/components/common';
import { createNewUser, getWholeUserTable } from '~/models/user';
import { Lang, LangCode } from '~/types/lang';
import { RoleType } from '~/types/role';
import { schemaValidator } from '~/utils/schema_validator';
import { createNewLang } from '~/models/lang';
import { newLangSchema, newTeamSchema, newUserSchema } from '~/services/__app/admin';
import { Team } from '~/types/team';
import { createNewTeam } from '~/models/team';
import { UserForm, TeamForm } from '~/components';
import { LangForm } from '~/components/lang_form';
const getLoaderData = async () => {
  const userTable = await getWholeUserTable();
  const teams: Team[] = [];
  const users: User[] = [];
  const langs: Lang[] = [];
  for (const ttype of userTable) {
    if (ttype.SK?.startsWith('USER')) {
      // we remove password, since there is no need let frontend knows password
      const { password, ...rest } = ttype as User;
      users.push(rest);
    }
    if (ttype.SK?.startsWith('TEAM')) {
      teams.push(ttype as Team);
    }
    if (ttype.SK?.startsWith('LANG')) {
      langs.push(ttype as Lang);
    }
  }
  return {
    teams,
    users,
    langs,
  };
};
export const loader = async () => {
  const { teams, users, langs } = await getLoaderData();
  return json<{ teams: Team[]; users: User[]; langs: Lang[] }>({
    teams,
    users,
    langs,
  });
};

const handleCreateNewUser = async (user: User) => {
  try {
    const newUser = { ...user, roles: [user.roles] };
    const result = await schemaValidator({
      schema: newUserSchema(),
      obj: newUser,
    });
    await createNewUser(result);
    return json({ data: [] }, { status: 200 });
  } catch (errors) {
    return json({ errors: errors });
  }
};

const handleCreateNewTeam = async (team: Team) => {
  try {
    const result = await schemaValidator({
      schema: newTeamSchema(),
      obj: team,
    });
    await createNewTeam(result);
    return json({ data: [] }, { status: 200 });
  } catch (errors) {
    return json({ errors: errors });
  }
};

const handleCreateNewLang = async (lang: Lang) => {
  try {
    const result = await schemaValidator({
      schema: newLangSchema(),
      obj: lang,
    });
    await createNewLang(result);
    return json({ data: [] }, { status: 200 });
  } catch (errors) {
    return json({ errors: errors });
  }
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
  } = entryData as {
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
    roles: unknown;
  };
  if (intent && intent === 'new_user') {
    return await handleCreateNewUser({
      username,
      email,
      password,
      team,
      roles: roles as RoleType[],
      origin_lang,
      target_lang,
      first_login: true,
    });
  }
  if (intent && intent === 'new_team') {
    return await handleCreateNewTeam({ name: team_name as string, alias: team_alias as string });
  }
  if (intent && intent === 'new_lang') {
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
    <Flex p={10} background="secondary.800" w="100%" flexDir="column">
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
                body={<UserForm teams={teams} langs={langs} isNew={true} />}
                isOpen={isOpenNewUser}
                onClose={onCloseNewUser}
                value="new_user"
              />
            </span>
          </Tooltip>
          <Tooltip label="add a new team" placement="left">
            <span>
              <IconButton
                colorScheme={'iconButton'}
                borderRadius={'50%'}
                w={12}
                h={12}
                aria-label="open admin edit buttons"
                icon={<RiTeamLine />}
                onClick={onOpenNewTeam}
              />
              <FormModal
                header="Add a New Team"
                body={<TeamForm teams={teams} onClose={onCloseNewTeam} />}
                isOpen={isOpenNewTeam}
                onClose={onCloseNewTeam}
                value="new_team"
              />
            </span>
          </Tooltip>
          <Tooltip label="add a new language" placement="left">
            <span>
              <IconButton
                colorScheme={'iconButton'}
                borderRadius={'50%'}
                w={12}
                h={12}
                aria-label="open admin edit buttons"
                icon={<FaLanguage />}
                onClick={onOpenNewLang}
              />
              <FormModal
                header="Add a New Language"
                body={<LangForm langs={langs} onClose={onCloseNewLang} />}
                isOpen={isOpenNewLang}
                onClose={onCloseNewLang}
                value="new_lang"
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
        aria-label="open admin edit buttons"
        icon={<EditIcon />}
        onClick={onToggle}
      />
    </Box>
  );
};
