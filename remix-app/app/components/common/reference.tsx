import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import {
  Box,
  ButtonGroup,
  Card,
  CardBody,
  Editable,
  EditablePreview,
  EditableTextarea,
  Flex,
  Heading,
  IconButton,
  Stack,
  StackDivider,
  Text,
  Radio,
} from '@chakra-ui/react';
import { useLocation, useNavigate, useSubmit } from '@remix-run/react';
import { useMemo, useState, useEffect } from 'react';
import { Intent } from '~/types/common';
import type { CreatedType, Paragraph, Reference } from '../../types';
import { splitParagraph } from '../../utils';

export const OriginReference = ({
  origin,
  SK,
  selectedParagraph,
}: {
  origin: string;
  SK: string;
  selectedParagraph: string;
}) => {
  return (
    <Radio ml={-6} borderColor={'primary.300'} value={SK}>
      <Text
        bg={selectedParagraph === SK ? 'primary.300' : 'inherit'}
        p={selectedParagraph === SK ? 1 : 0}
        borderRadius={selectedParagraph === SK ? 4 : 0}
      >
        {origin}
      </Text>
    </Radio>
  );
};

interface TReference {
  id?: string;
  name: string;
  content: string[];
}
export const ReferencePairForStaging = (props: {
  origin: string;
  references: TReference[];
  paragraphIndex?: number;
  sentenceIndex?: number;
  totalSentences?: number;
  paragraphId?: string;
  totalParagraphs?: number;
  finish: boolean;
}) => {
  const {
    origin,
    references,
    paragraphIndex = 0,
    sentenceIndex = 0,
    totalSentences = 0,
    paragraphId = '',
    finish,
  } = props;
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (finish) {
      const newLocation = location.pathname.replace('/staging', '');
      navigate(newLocation);
    }
  }, [finish, navigate, location]);

  return (
    <Card bg={'secondary.300'}>
      <CardBody>
        <Stack divider={<StackDivider />} spacing='4'>
          <Box>
            <Heading size='xs' textTransform='uppercase'>
              Origin
            </Heading>
            <Text>{origin}</Text>
          </Box>
          <ReferencePairForStagingElement
            references={references}
            paragraphId={paragraphId}
            paragraphIndex={paragraphIndex}
            sentenceIndex={sentenceIndex}
            totalSentences={totalSentences}
          />
        </Stack>
      </CardBody>
    </Card>
  );
};

export const ReferencePairForStagingElement = ({
  references,
  paragraphIndex,
  sentenceIndex,
  totalSentences,
  paragraphId,
}: {
  references: TReference[];
  paragraphIndex: number;
  sentenceIndex: number;
  totalSentences: number;
  paragraphId: string;
}) => {
  const [values, setValues] = useState<TReference[]>([...references]);

  const [isEditing, setIsEditing] = useState(false);

  const handelReferenceChanges = (index: number, content: string) => {
    const newValues = [...values];
    newValues[index]['content'] = [content];
    setValues(newValues);
    setIsEditing(true);
  };

  const submit = useSubmit();
  const handleSubmit = () => {
    const params = {
      intent: Intent.CREATE_REFERENCE,
      paragraphIndex: paragraphIndex.toString(),
      sentenceIndex: sentenceIndex.toString(),
      totalSentences: totalSentences.toString(),
      content: JSON.stringify(values),
      paragraphId,
    };
    submit(params, { method: 'post' });
  };

  return (
    <Box>
      {references.map((value, i) => (
        <Box key={i}>
          <Heading size='xs' textTransform='uppercase'>
            {value.name}
          </Heading>
          <Flex height={'65px'} justify={'flex-start'} align={'center'}>
            <Editable defaultValue={'Click to edit'} w={'100%'}>
              <EditablePreview />
              <EditableTextarea
                onBlur={(e) => {
                  if (!e.target.value) {
                    handelReferenceChanges(i, 'Click to edit');
                  }
                }}
                onChange={(e) => handelReferenceChanges(i, e.target.value)}
              />
            </Editable>
          </Flex>
        </Box>
      ))}
      {isEditing ? (
        <ButtonGroup>
          <IconButton
            size={'sm'}
            icon={<CheckIcon />}
            aria-label='submit reference'
            onClick={handleSubmit}
          />
          <IconButton
            onClick={() => setIsEditing(false)}
            size={'sm'}
            icon={<CloseIcon />}
            aria-label='close reference edit button'
          />
        </ButtonGroup>
      ) : null}
    </Box>
  );
};

export const ReferencePair = (props: {
  origin: Paragraph;
  references: CreatedType<Reference>[];
}) => {
  const { origin, references } = props;

  const originSentences = useMemo(() => {
    const sentences = splitParagraph(origin);
    return sentences.length > 1 ? sentences : [];
  }, [origin]);

  return (
    <>
      <Card bg={'secondary.300'}>
        <CardBody>
          <Stack divider={<StackDivider />} spacing='4'>
            <Box>
              <Heading size='xs' textTransform='uppercase'>
                Origin
              </Heading>
              <Text fontSize={'lg'}>{origin.content}</Text>
            </Box>
            {references?.map((reference, index) => (
              <Box key={index}>
                <Heading size='xs' textTransform='uppercase' mb={2} color={'primary.300'}>
                  {originSentences[index]}
                </Heading>
                <ReferenceElement reference={reference} />
              </Box>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </>
  );
};

export const ReferenceElement = ({ reference }: { reference: CreatedType<Reference> }) => {
  const [contents, setContents] = useState<{ content: string[]; name: string }[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const submit = useSubmit();
  const handleSubmit = () => {
    const params = {
      intent: Intent.UPDATE_REFERENCE,
      content: JSON.stringify(contents),
      id: reference.SK,
    };
    submit(params, { method: 'post' });
    setIsEditing(false);
  };

  const handleUpdate = (name: string, value: string) => {
    const updatedContent = contents.map((content) => {
      if (content.name === name) {
        return { ...content, content: [value] }; // Create a new object with the updated name
      }
      return content; // Return unchanged items
    });
    setIsEditing(true);
    setContents(updatedContent);
  };

  useEffect(() => {
    if (reference.content) {
      const obj = JSON.parse(reference.content) as {
        content: string[];
        name: string;
      }[];
      setContents(obj);
    }
  }, [reference]);

  return (
    <Box>
      {contents?.map((content, index) => (
        <Flex minH={'85px'} direction={'column'} justify={'flex-start'} key={index}>
          <Heading size='xs' textTransform='uppercase'>
            {content.name}
          </Heading>
          <Editable defaultValue={'Click to edit'} value={contents[index].content[0]}>
            <EditablePreview />
            <EditableTextarea
              onBlur={(e) => {
                if (!e.target.value) {
                  handleUpdate(content.name, 'Click to edit');
                }
              }}
              onChange={(e) => handleUpdate(content.name, e.target.value)}
            />
          </Editable>
        </Flex>
      ))}
      {isEditing ? (
        <ButtonGroup>
          <IconButton
            size={'sm'}
            icon={<CheckIcon />}
            aria-label='update reference'
            onClick={handleSubmit}
          />
          <IconButton
            onClick={() => setIsEditing(false)}
            size={'sm'}
            icon={<CloseIcon />}
            aria-label='close reference edit button'
          />
        </ButtonGroup>
      ) : null}
    </Box>
  );
};
