import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tag,
  VStack,
} from '@chakra-ui/react';
import { json } from '@remix-run/node';
import type { LoaderArgs } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { getAllNotResolvedCommentsForMe } from '~/models/comment';
import type { AlertStatus } from '@chakra-ui/react';
import { assertAuthUser } from '~/auth.server';
import { TranslationProtocol } from '~/components';
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';
import { getAllTeams } from '~/models/team';
import { getAllLangs } from '~/models/lang';
import { getAllSutras } from '~/models/sutra';
import { getRollsBySutraId } from '~/models/roll';

type SutraStat = {
  name: string;
  stats: {
    waiting: number;
    finished: number;
    working: number;
  };
};

type TripitakaStat = {
  name: string;
  stats: {
    waiting: number;
    finished: number;
    working: number;
  };
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await assertAuthUser(request);
  const [comments, teams, langs] = await Promise.all([
    getAllNotResolvedCommentsForMe(user),
    getAllTeams(),
    getAllLangs(),
  ]);
  const sutras = await getAllSutras();
  const totalSutras = sutras?.filter((sutra) => sutra.SK.includes('ZH')).length ?? 0;
  const workingSutras =
    sutras?.filter((sutra) => sutra.SK.includes('EN') && !sutra.finish).length ?? 0;
  const finishedSutras =
    sutras?.filter((sutra) => sutra.SK.includes('EN') && sutra.finish).length ?? 0;
  const tripitakaStats: TripitakaStat = {
    name: 'Tripitaka',
    stats: {
      waiting: totalSutras - (workingSutras + finishedSutras),
      finished: finishedSutras,
      working: workingSutras,
    },
  };
  const sutrasNotFinished = sutras?.filter((sutra) => !sutra.finish);
  const sutraStats = await Promise.all(
    sutrasNotFinished?.map(async (sutra) => {
      const { roll_count, title } = sutra;
      const rolls = await getRollsBySutraId(sutra.SK);
      const finishedRolls = rolls?.filter((roll) => roll.finish);
      const workingRolls = rolls?.length - finishedRolls.length;
      return {
        name: title,
        stats: {
          waiting: roll_count - (workingRolls + finishedRolls.length),
          finished: finishedRolls.length,
          working: workingRolls,
        },
      } as SutraStat;
    })
  );
  return json({ comments, teams, langs, sutraStats, tripitakaStats });
};

export default function TripitakaRoute() {
  const { comments, teams, langs, sutraStats, tripitakaStats } = useLoaderData<typeof loader>();
  const sutraMetric = sutraStats.map((entry) => {
    const result = Object.entries(entry.stats).reduce((acc, [key, value]) => {
      const obj = { name: key, value };
      acc.push(obj);
      return acc;
    }, [] as Record<string, string | number>[]);
    return {
      name: entry.name,
      data: result,
    };
  });

  const tripitakaMetric = Object.entries(tripitakaStats?.stats).reduce((acc, [key, value]) => {
    const obj = { name: key, value };
    acc.push(obj);
    return acc;
  }, [] as Record<string, string | number>[]);

  comments?.sort((a, b) => b.priority - a.priority);
  const commentsComp = comments.map((ccomment) => {
    const { path, content, comment, priority, paragraphId } = ccomment;
    const priorityLevel = priority as number;
    const statusValue = {
      1: 'info',
      2: 'warning',
      3: 'error',
    }[priorityLevel] as AlertStatus;
    return (
      <Link key={comment} to={`${path}#${paragraphId}`} style={{ width: '100%' }}>
        <Alert status={statusValue}>
          <AlertIcon />
          <AlertTitle textOverflow={'ellipsis'} whiteSpace='nowrap' overflow={'hidden'} maxW='50%'>
            {content}
          </AlertTitle>
          <AlertDescription textOverflow={'ellipsis'} whiteSpace='nowrap' overflow={'hidden'}>
            {comment}
          </AlertDescription>
        </Alert>
      </Link>
    );
  });
  const COLORS = ['#0088FE', '#00C49F', '#FF8042'];

  return (
    <Flex p={10} background='secondary.800' w='100%' flexDir='column'>
      <Box mb={4}>
        <TranslationProtocol />
      </Box>
      <Grid h='300px' templateRows='repeat(2, 1fr)' templateColumns='repeat(5, 1fr)' gap={4}>
        <GridItem bg='papayawhip' borderRadius={10} padding={2}>
          <Stat>
            <StatLabel>Supported Languages</StatLabel>
            <StatNumber>{langs?.length ?? 0}</StatNumber>
            <StatHelpText>
              {langs?.length
                ? langs.map((lang) => (
                    <Tag key={lang.alias} size={'sm'} variant='solid' colorScheme='teal' mr={1}>
                      {lang.alias}
                    </Tag>
                  ))
                : null}
            </StatHelpText>
          </Stat>
        </GridItem>
        <GridItem rowSpan={2}>
          <Heading size={'sm'}>{tripitakaStats.name} (sutras)</Heading>
          <ResponsiveContainer width='100%' height='90%'>
            <PieChart>
              <Pie
                data={tripitakaMetric}
                dataKey='value'
                fill='#8884d8'
                outerRadius={80}
                innerRadius={40}
                label
              >
                {tripitakaMetric.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </GridItem>
        <GridItem rowSpan={2}>
          <Heading size={'sm'}>{sutraMetric?.[0]?.name} (rolls)</Heading>
          <ResponsiveContainer width='100%' height='90%'>
            <PieChart>
              <Pie
                data={sutraMetric?.[0]?.data}
                dataKey='value'
                fill='#8884d8'
                outerRadius={80}
                innerRadius={40}
                label
              >
                {sutraMetric?.[0]?.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </GridItem>
        <GridItem rowSpan={2} colSpan={2}>
          <Heading as={'h3'} size='md'>
            Comments to be resolved
          </Heading>
          <VStack spacing={2}>{commentsComp}</VStack>
        </GridItem>
        <GridItem bg='papayawhip' borderRadius={10} padding={2}>
          <Stat>
            <StatLabel>Number of Teams</StatLabel>
            <StatNumber>{teams?.length ?? 0}</StatNumber>
            <StatHelpText>
              {teams?.length
                ? teams?.map((team) => (
                    <Tag key={team.alias} size={'sm'} variant='solid' colorScheme='cyan' mr={1}>
                      {team?.alias}
                    </Tag>
                  ))
                : null}
            </StatHelpText>
          </Stat>
        </GridItem>
      </Grid>
    </Flex>
  );
}
