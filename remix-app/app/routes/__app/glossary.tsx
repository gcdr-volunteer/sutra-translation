import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getAllGlossary } from '~/models/glossary';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Divider,
  Flex,
  Heading,
  IconButton,
  SimpleGrid,
  Tag,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { AiOutlinePlus } from 'react-icons/ai';
import { FormModal } from '~/components/common';
import { Intent } from '~/types/common';
import { GlossaryForm } from '~/components/common/glossary_form';
import { useActionData, useLoaderData } from '@remix-run/react';
import type { Glossary } from '~/types';
import { AiOutlineEdit } from 'react-icons/ai';
import { assertAuthUser } from '~/auth.server';
import { handleCreateNewGlossary } from '~/services/__app/tripitaka/$sutraId/$rollId/staging';
import { serverError } from 'remix-utils';
import { useEffect } from 'react';

export const loader = async () => {
  const glossaries = await getAllGlossary();
  return json({ glossaries });
};

export const action = async ({ request }: ActionArgs) => {
  const user = await assertAuthUser(request);
  const formdata = await request.formData();
  const entryData = Object.fromEntries(formdata.entries());

  if (entryData.intent === Intent.CREATE_GLOSSARY) {
    return await handleCreateNewGlossary({
      PK: entryData?.PK as string,
      SK: entryData?.SK as string,
      origin: entryData?.origin as string,
      target: entryData?.target as string,
      short_definition: entryData?.short_definition as string,
      options: entryData?.options as string,
      note: entryData?.note as string,
      example_use: entryData?.example_use as string,
      related_terms: entryData?.related_terms as string,
      terms_to_avoid: entryData?.terms_to_avoid as string,
      discussion: entryData?.discussion as string,
      createdBy: user?.SK,
      creatorAlias: user?.username,
    });
  }
  throw serverError({ message: 'unknown error' });
  // return json({});
};
export default function GlossaryRoute() {
  const { glossaries } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const glossaryComp = glossaries.map((glossary) => (
    <GlossaryView
      key={glossary.SK}
      glossary={glossary}
      glossaryForm={<GlossaryDetailView glossary={glossary} />}
    />
  ));
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    if (actionData?.intent) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);
  return (
    <Flex p={10} background='secondary.800' w='100%' flexDir='column'>
      <Heading as='h5' size={'md'}>
        Glossary
      </Heading>
      <Divider mt={4} mb={4} borderColor={'primary.300'} />
      {glossaryComp}
      <FormModal
        header='Add new glossary'
        body={<GlossaryForm />}
        isOpen={isOpen}
        onClose={onClose}
        value={Intent.CREATE_GLOSSARY}
        modalSize='3xl'
      />
      <IconButton
        borderRadius={'50%'}
        w={12}
        h={12}
        pos={'fixed'}
        bottom={8}
        right={8}
        icon={<AiOutlinePlus />}
        aria-label='edit roll'
        colorScheme={'iconButton'}
        onClick={() => onOpen()}
      />
    </Flex>
  );
}

type GlossaryViewProps = {
  glossary: Glossary;
  glossaryForm: React.ReactNode;
};
export const GlossaryView = ({ glossary, glossaryForm }: GlossaryViewProps) => {
  return (
    <Box>
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton _expanded={{ bg: 'primary.800', color: 'white' }}>
              <Box flex='1' textAlign='left'>
                <Tag bg='green.100' mr={4}>
                  {glossary.origin}
                </Tag>
                <Tag bg='blue.100'>{glossary.target}</Tag>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel background={'secondary.500'}>{glossaryForm}</AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

type GlossaryDetailViewProps = {
  glossary: Glossary;
};
const GlossaryDetailView = ({ glossary }: GlossaryDetailViewProps) => {
  const actionData = useActionData<typeof action>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    if (actionData?.intent) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);
  const map = new Map<string, string | undefined>();
  map.set('origin', glossary.origin);
  map.set('target', glossary.target);
  map.set('short_definition', glossary.short_definition);
  map.set('options', glossary.options);
  map.set('note', glossary.note);
  map.set('example_use', glossary.example_use);
  map.set('related_terms', glossary.related_terms);
  map.set('terms_to_avoid', glossary.terms_to_avoid);
  map.set('discussion', glossary.discussion);
  const comp = Array.from(map.entries())
    .filter(([key, value]) => value)
    .map(([key, value]) => (
      // eslint-disable-next-line react/jsx-key
      <Box
        key={key}
        border={'1px'}
        p={2}
        borderColor={'gray.300'}
        bg={key === 'origin' ? 'green.100' : key === 'target' ? 'blue.100' : 'inherit'}
      >
        <Heading size='sm'>{key}</Heading>
        <Text>{value}</Text>
      </Box>
    ));

  return (
    <Flex flexDir={'column'}>
      <SimpleGrid columns={3}>
        {comp}
        <FormModal
          header='update glossary'
          body={<GlossaryForm props={glossary} />}
          isOpen={isOpen}
          onClose={onClose}
          value={Intent.CREATE_GLOSSARY}
          modalSize='3xl'
        />
      </SimpleGrid>
      <IconButton
        colorScheme={'iconButton'}
        aria-label='update glossary'
        onClick={onOpen}
        icon={<AiOutlineEdit />}
        alignSelf='end'
      >
        Update
      </IconButton>
    </Flex>
  );
};
