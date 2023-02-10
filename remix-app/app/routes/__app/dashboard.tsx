import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
  Heading,
  VStack,
} from '@chakra-ui/react';
import { json } from '@remix-run/node';
import type { LoaderArgs } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { getAllNotResolvedCommentsForMe } from '~/models/comment';
import type { AlertStatus } from '@chakra-ui/react';
import { assertAuthUser } from '~/auth.server';

export const loader = async ({ request }: LoaderArgs) => {
  const user = await assertAuthUser(request);
  const comments = await getAllNotResolvedCommentsForMe(user);
  return json({ comments });
};

export default function TripitakaRoute() {
  const loadData = useLoaderData<typeof loader>();
  loadData?.comments?.sort((a, b) => b.priority - a.priority);
  const commentsComp = loadData?.comments.map((ccomment) => {
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

  return (
    <Flex p={10} background='secondary.800' w='100%' flexDir='row'>
      <Box flex={1}>Home</Box>
      <VStack spacing={4} flex={1} alignItems={'start'}>
        <Heading as={'h5'} size='lg'>
          Comments to be resolved
        </Heading>
        {commentsComp}
      </VStack>
    </Flex>
  );
}
