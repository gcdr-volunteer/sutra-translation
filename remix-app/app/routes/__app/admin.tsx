import {
  Flex,
  Text,
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
  Select,
  useDisclosure,
  IconButton,
  Fade,
  VStack,
  Tooltip,
  SimpleGrid,
  FormErrorMessage,
  HStack,
  List,
  ListItem,
  UnorderedList,
  TableContainer,
  Table,
  TableCaption,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from '@chakra-ui/react';
import * as yup from 'yup';
import { ChangeEvent, useCallback, useState } from 'react';
import { json, ActionArgs } from '@remix-run/node';
import { useLoaderData, useActionData, Form } from '@remix-run/react';
import { User } from '~/types/user';
import { EditIcon } from '@chakra-ui/icons';
import { RiUser2Line, RiTeamLine } from 'react-icons/ri';
import { FaLanguage } from 'react-icons/fa';
import { FormModal } from '~/components/common';
import { logger, utcNow } from '~/utils';
import { Team } from '~/types/team';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { createNewTeam, getAllTeams, getTeam } from '~/models/team';
import { getWholeUserTable } from '~/models/user';
import { Lang } from '~/types/lang';
import { Role } from '~/types/role';
import { DeleteIcon } from '@chakra-ui/icons';
import { baseSchemaForCreate, schemaValidator } from '~/utils/schema_validator';
const getLoaderData = async () => {
  const userTable = await getWholeUserTable();
  const teams: Team[] = [];
  const roles: Role[] = [];
  const users: User[] = [];
  const langs: Lang[] = [];
  for (const ttype of userTable) {
    if (ttype.SK?.startsWith('USER') && ttype.kind === 'USER') {
      users.push(ttype);
    }
    if (ttype.SK?.startsWith('TEAM') && ttype.kind === 'TEAM') {
      teams.push(ttype);
    }
    if (ttype.SK?.startsWith('ROLE') && ttype.kind === 'ROLE') {
      roles.push(ttype);
    }
    if (ttype.SK?.startsWith('LANG') && ttype.kind === 'LANG') {
      langs.push(ttype);
    }
  }
  return {
    teams,
    roles,
    users,
    langs,
  };
};
export const loader = async () => {
  const teams = await getAllTeams();
  return json<{ teams: Team[]; roles: string[]; users: User[]; langs: string[] }>({
    teams,
    roles: [],
    users: [],
    langs: [],
  });
};

const newTeamSchema = (baseSchema: yup.AnyObjectSchema) => {
  const teamSchema = baseSchema.shape({
    name: yup
      .string()
      .trim()
      .required('team name cannot be empty')
      .test('is-name-exist', 'team name already registered', async (value) => {
        const team = await getTeam(value!);
        return !Boolean(team);
      }),
    alias: yup.string().trim().required('team alias cannot be empty'),
  });
  return teamSchema;
};

const newUserSchema = (baseSchema: yup.AnyObjectSchema) => {
  const userSchema = baseSchema.shape({
    username: yup
      .string()
      .lowercase()
      .trim()
      .required('email canot be empty')
      .email('this is not valid email format'),
    password: yup.string().required('password cannot be empty'),
    team: yup
      .string()
      .test('is-team-exist', 'we dont have this team, please create first', async (value) => {
        const team = await getTeam(value!);
        return Boolean(team);
      }),
    orgin_lang: yup.string().required(),
  });
};

const handleCreateNewTeam = async (team: Team) => {
  try {
    const result = await schemaValidator({
      schema: newTeamSchema(baseSchemaForCreate()),
      obj: team,
    });
    await createNewTeam(result);
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
    username,
    password,
    role,
    team,
    origin_lang,
    target_lang,
    team_name,
    team_alias,
  } = entryData;
  if (intent && intent === 'new_user') {
    logger.log('action', 'new_user', {
      username,
      password,
      team,
      role,
      origin_lang,
      target_lang,
    });
  }
  if (intent && intent === 'new_team') {
    return await handleCreateNewTeam({ name: team_name as string, alias: team_alias as string });
  }
  return json({});
};
export default function AdminRoute() {
  const { users, teams, roles, langs } = useLoaderData<typeof loader>();
  const usersComp = users?.map((user) => {
    return (
      <UserConfig
        key={user.email}
        user={user}
        userform={<UserForm {...user} teams={teams} langs={langs} roles={roles} />}
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

interface UserFormProps {
  teams: Team[];
  langs: string[];
  roles: string[];
  isNew?: boolean;
}

interface AdminActionButtonsProps {
  roles: string[];
  teams: Team[];
  langs: string[];
}
const AdminActionButtons = (props: AdminActionButtonsProps) => {
  const { roles, teams, langs } = props;
  const { isOpen, onToggle } = useDisclosure();
  const { isOpen: isOpenNewUser, onOpen: onOpenNewUser, onClose: onCloseNewUser } = useDisclosure();
  const { isOpen: isOpenNewTeam, onOpen: onOpenNewTeam, onClose: onCloseNewTeam } = useDisclosure();

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
                body={<UserForm teams={teams} roles={roles} langs={langs} isNew={true} />}
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
  const [formState, setFormState] = useState<User>({
    username: '',
    email: '',
    roles: ['Viewer'],
    team: {
      name: 'Team1',
      alias: 'Master Sure',
    },
    origin_lang: 'ZH',
    target_lang: 'EN',
    first_login: false,
    password: '',
  });

  const handleFormStateUpdate = (
    type: string,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let newFormState: User;
    if (type === 'roles') {
      const roles = e.target.value as Role['name'];

      newFormState = { ...formState, roles: [roles] };
    } else {
      newFormState = { ...formState, [type]: e.target.value };
    }
    setFormState(newFormState);
  };
  const { teams, langs, roles, isNew } = props;
  return (
    <SimpleGrid columns={isNew ? 2 : 3} spacing={4}>
      <FormControl>
        <FormLabel>User name:</FormLabel>
        <Input
          type="text"
          value={formState.username}
          onChange={(e) => handleFormStateUpdate('username', e)}
          name="username"
        />
      </FormControl>
      {isNew ? (
        <FormControl>
          <FormLabel>Password: </FormLabel>
          <Input
            type="text"
            value={formState.password}
            onChange={(e) => handleFormStateUpdate('password', e)}
            name="password"
          />
        </FormControl>
      ) : null}
      <FormControl>
        <FormLabel>Email:</FormLabel>
        <Input
          type="email"
          value={formState.email}
          onChange={(e) => handleFormStateUpdate('email', e)}
          name="email"
        />
      </FormControl>
      <FormControl>
        <FormLabel>Team:</FormLabel>
        <Select
          value={formState.team.name}
          onChange={(e) => handleFormStateUpdate('team', e)}
          name="team"
          multiple={false}
        >
          {teams?.map((team, index) => (
            <option key={team.name} value={team.name}>
              {team.alias || team.name}
            </option>
          ))}
        </Select>
      </FormControl>
      <FormControl>
        <FormLabel>Source Language:</FormLabel>
        <Select
          value={formState.origin_lang}
          onChange={(e) => handleFormStateUpdate('origin_lang', e)}
          name="origin_lang"
          multiple={false}
        >
          {langs?.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </Select>
      </FormControl>
      <FormControl>
        <FormLabel>Target Language:</FormLabel>
        <Select
          value={formState.target_lang}
          onChange={(e) => handleFormStateUpdate('target_lang', e)}
          name="target_lang"
          multiple={false}
        >
          {langs?.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </Select>
      </FormControl>
      <FormControl>
        <FormLabel>Role:</FormLabel>
        <Select
          value={formState.roles[0]}
          onChange={(e) => handleFormStateUpdate('roles', e)}
          name="role"
          multiple={false}
        >
          {roles?.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </Select>
      </FormControl>
    </SimpleGrid>
  );
};

interface TeamFormProps {
  teams: Team[];
  onClose: () => void;
}
const TeamForm = (props: TeamFormProps) => {
  const { errors } = useActionData<{ errors: { name: string; alias: string } }>() || {};
  const [formState, setFormState] = useState<Team>({
    name: '',
    alias: '',
  });
  const handleFormStateUpdate = (
    type: string,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const newFormState = { ...formState, [type]: e.target.value };
    setFormState(newFormState);
  };
  const { teams } = props;
  return (
    <Box>
      {teams.length ? (
        <TableContainer mb={8}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Team</Th>
                <Th>Alias</Th>
              </Tr>
            </Thead>
            <Tbody>
              {teams.map((team) => (
                <Tr key={team.name}>
                  <Td>{team.name}</Td>
                  <Td>{team.alias}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : null}
      <SimpleGrid columns={2} spacing={4}>
        <FormControl isInvalid={Boolean(errors?.name)}>
          <FormLabel>Team name:</FormLabel>
          <Input
            type="text"
            value={formState.name}
            onChange={(e) => handleFormStateUpdate('name', e)}
            name="team_name"
          />
          {errors?.name ? <FormErrorMessage>{errors?.name}</FormErrorMessage> : null}
        </FormControl>
        <FormControl isInvalid={Boolean(errors?.alias)}>
          <FormLabel>Team alias:</FormLabel>
          <Input
            type="text"
            value={formState.alias}
            onChange={(e) => handleFormStateUpdate('alias', e)}
            name="team_alias"
          />
          {errors?.alias ? <FormErrorMessage>{errors?.alias}</FormErrorMessage> : null}
        </FormControl>
      </SimpleGrid>
    </Box>
  );
};
