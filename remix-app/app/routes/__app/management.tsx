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
  Fade,
  VStack,
  Tooltip,
  Icon,
  HStack,
  Text,
  Input,
} from '@chakra-ui/react';
import { json } from '@remix-run/node';
import type { ActionArgs } from '@remix-run/node';
import { Intent } from '~/types/common';
import { EditIcon } from '@chakra-ui/icons';
import { FormModal } from '~/components/common';
import { getLoaderData } from '~/services/__app/admin';
import type { Team, Sutra, CreatedType, RefBook, Glossary } from '~/types';
import { getAllSutraThatFinished } from '~/models/sutra';
import { useActionData, useLoaderData, useSubmit } from '@remix-run/react';
import { ReferenceBookForm } from '~/components/reference_book_form';
import { handleCreateRefBook } from '~/services/__app/management';
import { getAllRefBooks } from '~/models/reference';
import { useCallback, useEffect, useState } from 'react';
import { BsBook, BsFillCloudUploadFill, BsCloudUpload } from 'react-icons/bs';
import { FaBook } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
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
  if (entryData?.intent === Intent.BULK_CREATE_GLOSSARY) {
    const glossaries = JSON.parse(entryData.glossaries as string) as Glossary[];
    console.log(glossaries);
  }
  return json({});
}

export default function ManagementRoute() {
  const { teams, sutras, refBooks } = useLoaderData<typeof loader>();
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
      <ManagementButtons teams={teams} sutras={sutras} />
    </Flex>
  );
}

type ManagementButtonsProps = {
  teams: Team[];
  sutras: CreatedType<Sutra>[];
};
export const ManagementButtons = ({ teams, sutras }: ManagementButtonsProps) => {
  const { isOpen, onToggle } = useDisclosure();
  const {
    isOpen: isReferenceBookOpen,
    onClose: onReferenceBookClose,
    onOpen: onReferenceBookOpen,
  } = useDisclosure();
  const { isOpen: isUploadOpen, onClose: onUploadClose, onOpen: onUploadOpen } = useDisclosure();
  const actionData = useActionData();
  useEffect(() => {
    if (actionData?.intent === Intent.CREATE_REF_BOOK) {
      onReferenceBookClose();
    }
  }, [actionData, onReferenceBookClose]);
  return (
    <Box pos={'fixed'} right={8} bottom={8}>
      <Fade in={isOpen}>
        <VStack spacing={4} mb={4}>
          <Tooltip label='add a new reference book' placement='left'>
            <span>
              <IconButton
                colorScheme={'iconButton'}
                borderRadius={'50%'}
                w={12}
                h={12}
                aria-label='open create reference book modal'
                icon={<BsBook />}
                onClick={onReferenceBookOpen}
              />
              <FormModal
                header='Create Reference Book'
                body={<ReferenceBookForm teams={teams} sutras={sutras} />}
                isOpen={isReferenceBookOpen}
                onClose={onReferenceBookClose}
                value={Intent.CREATE_REF_BOOK}
              />
            </span>
          </Tooltip>
          <Tooltip label='upload glossary' placement='left'>
            <span>
              <IconButton
                colorScheme={'iconButton'}
                borderRadius={'50%'}
                w={12}
                h={12}
                aria-label='open upload glossary modal'
                icon={<BsFillCloudUploadFill />}
                onClick={onUploadOpen}
              />
              <FormModal
                header='upload bulk glossary'
                body={<CsvUpload />}
                isOpen={isUploadOpen}
                onClose={onUploadClose}
                value={Intent.BULK_CREATE_GLOSSARY}
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
        aria-label='open management edit buttons'
        icon={<EditIcon />}
        onClick={onToggle}
      />
    </Box>
  );
};

interface DataRow {
  [key: string]: string;
}
export const CsvUpload = () => {
  const [dropped, setDropped] = useState(false);
  const [errors, setErrors] = useState('');
  const glossaries: Glossary[] = [];
  const submit = useSubmit();
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        Papa.parse(file, {
          header: true,
          complete: (result) => {
            const fields = [
              'origin',
              'target',
              'short definition',
              'options',
              'notes',
              'example use',
              'related terms',
              'terms to avoid',
              'discussion',
            ];
            const data: DataRow[] = result.data as DataRow[];
            const header = Object.keys(data?.[0]);
            fields.forEach((field) => {
              if (!header.includes(field)) {
                setErrors(`check if field ${field} in your csv file`);
              }
            });
            data.forEach((row) => {
              console.log(row);
              const origin = row?.['origin'];
              const target = row?.['target'];
              if (!origin) {
                setErrors('field origin cannot be empty');
              }
              if (!target) {
                setErrors('field target cannot be empty');
              }
              const glossary = fields.reduce((acc, cur) => {
                acc[cur.split(' ').join('_')] = row[cur];
                return acc;
              }, {} as Record<string, string>) as unknown as Glossary;
              glossaries.push(glossary);
            });
          },
        });
      });
    },
    [submit]
  );

  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    maxSize: 5e6,
    onDropAccepted: () => {
      setDropped(true);
    },
  });

  return (
    <Box>
      <HStack justifyContent={'center'} {...getRootProps()}>
        <input {...getInputProps()} />
        {dropped ? (
          <Icon as={FaBook} w={32} h={32} color={'green.300'} />
        ) : (
          <Icon
            as={BsCloudUpload}
            w={32}
            h={32}
            color={fileRejections.length ? 'red.600' : 'orange.300'}
          />
        )}
      </HStack>
      {dropped ? (
        errors ? (
          <Text textAlign={'center'} color='red.600'>
            {errors}
          </Text>
        ) : (
          <Text textAlign={'center'}>We are processing the records...</Text>
        )
      ) : (
        <Text textAlign={'center'}>Drop your csv file or click to select file (5MB max)</Text>
      )}
      {fileRejections?.length ? (
        <Text textAlign={'center'} color='red.600'>
          only allow upload one file at a time
        </Text>
      ) : null}
      <Input hidden={true} name='glossaries' value={JSON.stringify(glossaries)} />
      <Input hidden={true} name='intent' value={Intent.BULK_CREATE_GLOSSARY} />
    </Box>
  );
};
