import {
  Flex,
  Box,
  IconButton,
  useDisclosure,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from '@chakra-ui/react';
import { json } from '@remix-run/node';
import type { ActionArgs } from '@remix-run/node';
import { Intent } from '~/types/common';
import { EditIcon } from '@chakra-ui/icons';
import { FormModal } from '~/components/common';
import { getLoaderData } from '~/services/__app/admin';
import type { Team, Sutra, CreatedType, RefBook } from '~/types';
import { getAllSutraThatFinished } from '~/models/sutra';
import { useActionData, useLoaderData } from '@remix-run/react';
import { ReferenceBookForm } from '~/components/reference_book_form';
import { handleCreateRefBook } from '~/services/__app/management';
import { getAllRefBooks } from '~/models/reference';
import { useEffect } from 'react';
export async function loader({ request }: ActionArgs) {
  const { teams } = await getLoaderData();
  const sutras = await getAllSutraThatFinished();
  const rawRefBooks = await getAllRefBooks();

  const refBooks = rawRefBooks.map((refbook) => ({
    bookname: refbook.bookname,
    team: teams.find((teams) => teams.name === refbook.team)?.alias || '',
    sutra: sutras.find((sutra) => sutra.SK === refbook.sutraId)?.title || '',
  }));
  return json<{
    teams: Team[];
    sutras: CreatedType<Sutra>[];
    refBooks: { bookname: string; sutra: string; team: string }[];
  }>({
    teams,
    sutras,
    refBooks,
  });
}

export async function action({ request }: ActionArgs) {
  const formdata = await request.formData();
  const entryData = Object.fromEntries(formdata.entries());
  if (entryData?.intent === Intent.CREATE_REF_BOOK) {
    const refBook: RefBook = {
      bookname: entryData?.bookname as string,
      sutraId: entryData?.sutra as string,
      team: entryData?.team as string,
    };
    return await handleCreateRefBook(refBook);
  }
  return json({});
}

export default function ManagementRoute() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { teams, sutras, refBooks } = useLoaderData<typeof loader>();
  const actionData = useActionData();
  useEffect(() => {
    if (actionData?.intent === Intent.CREATE_REF_BOOK) {
      onClose();
    }
  }, [actionData, onClose]);
  return (
    <Flex p={10} background='secondary.800' w='100%' flexDir='column'>
      <TableContainer>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>Book Name</Th>
              <Th>Sutra Name</Th>
              <Th>Team Name</Th>
            </Tr>
          </Thead>
          <Tbody>
            {refBooks.map((refbook) => (
              <Tr key={refbook.bookname}>
                <Td>{refbook.bookname}</Td>
                <Td>{refbook.sutra}</Td>
                <Td>{refbook.team}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <FormModal
        header='Create Reference Book'
        body={<ReferenceBookForm teams={teams} sutras={sutras} />}
        isOpen={isOpen}
        onClose={onClose}
        value={Intent.CREATE_REF_BOOK}
      />
      <Box pos={'fixed'} right={8} bottom={8}>
        <IconButton
          colorScheme={'iconButton'}
          borderRadius={'50%'}
          w={12}
          h={12}
          aria-label='open admin edit buttons'
          icon={<EditIcon />}
          onClick={onOpen}
        />
      </Box>
    </Flex>
  );
}
