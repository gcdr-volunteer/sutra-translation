import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';
import type { AlertStatus } from '@chakra-ui/react';
import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { getAllNotResolvedCommentsForMe } from '~/models/comment';
import { Comment } from '~/types';

export const loader = async () => {
  const myComments = await getAllNotResolvedCommentsForMe();
  return json({ data: myComments });
};

export default function TripitakaRoute() {
  const loadData = useLoaderData<{ data: Comment[] }>();
  loadData?.data?.sort((a, b) => b.priority - a.priority);
  const commentsComp = loadData?.data.map((ccomment) => {
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
          <AlertTitle textOverflow={'ellipsis'} whiteSpace="nowrap" overflow={'hidden'} maxW="50%">
            {content}
          </AlertTitle>
          <AlertDescription textOverflow={'ellipsis'} whiteSpace="nowrap" overflow={'hidden'}>
            {comment}
          </AlertDescription>
        </Alert>
      </Link>
    );
  });

  return (
    <Flex p={10} background="secondary.800" w="100%" flexDir="row">
      <Box flex={1}>Home</Box>
      <VStack spacing={4} flex={1} alignItems={'start'}>
        <Heading as={'h5'} size="lg">
          Comments to be resolved
        </Heading>
        {commentsComp}
      </VStack>
    </Flex>
  );
}
