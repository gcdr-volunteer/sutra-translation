import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import {
  Box,
  ButtonGroup,
  Card,
  CardBody,
  Checkbox,
  Editable,
  EditablePreview,
  EditableTextarea,
  Flex,
  Heading,
  IconButton,
  Mark,
  Stack,
  StackDivider,
  Text,
  useBoolean,
} from '@chakra-ui/react';
import { useNavigate, useSubmit } from '@remix-run/react';
import { useEffect } from 'react';
import type { MutableRefObject } from 'react';
import { useMemo, useState } from 'react';
import { Intent } from '~/types/common';

export const OriginReference = ({
  origin,
  urlParams,
  SK,
}: {
  origin: string;
  urlParams: MutableRefObject<URLSearchParams>;
  SK: string;
}) => {
  const [toggle, setToggle] = useBoolean(false);
  useMemo(() => {
    if (toggle) {
      const urls = urlParams.current.getAll('p');
      if (!urls.includes(SK ?? '')) {
        urlParams.current.append('p', SK ?? '');
      }
      const paramsArray = Array.from(urlParams.current.entries());
      paramsArray.sort((a, b) => a[1].localeCompare(b[1]));
      urlParams.current = new URLSearchParams(paramsArray);
    } else {
      const newParams = new URLSearchParams();
      for (const [key, value] of urlParams.current.entries()) {
        if (value !== SK) {
          newParams.append(key, value);
        }
      }
      urlParams.current = newParams;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggle]);
  return (
    <Flex w={'85%'} flexDir={'row'} alignItems={'flex-start'} my={2}>
      <Checkbox ml={-6} borderColor={'primary.300'} onChange={setToggle.toggle}>
        <Text
          bg={toggle ? 'primary.300' : 'inherit'}
          p={toggle ? 2 : 0}
          borderRadius={toggle ? 4 : 0}
        >
          {origin}
        </Text>
      </Checkbox>
    </Flex>
  );
};

interface Reference {
  name: string;
  content: string[];
}
export const ReferencePair = (props: {
  origin: string;
  references: Reference[];
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
  const [originValue, setOriginValue] = useState({ name: 'Origin', content: 'click to edit' });
  const [values, setValues] = useState<Reference[]>([...references]);

  const [isEditing, setIsEditing] = useState(false);

  const handleOriginChange = (name: string, content: string) => {
    setOriginValue({ name, content });
    setIsEditing(true);
  };

  const handelReferenceChanges = (name: string, content: string, index: number) => {
    const newValues = values.map((value) => {
      // If this is the item we want to update, return a new object
      if (value.name === name) {
        return {
          ...value, // Copy all properties of the existing item
          content: [content], // Overwrite the content with the new content
        } as Reference;
      }

      // If this is not the item we want to update, return it as is
      return value;
    });
    setValues(newValues);
    setIsEditing(true);
  };

  const submit = useSubmit();
  const handleSubmit = () => {
    submit(
      {
        intent: Intent.CREATE_REFERENCE,
        paragraphIndex: paragraphIndex.toString(),
        sentenceIndex: sentenceIndex.toString(),
        totalSentences: totalSentences.toString(),
        content: JSON.stringify(values),
        paragraphId,
      },
      { method: 'post' }
    );
  };

  const navigate = useNavigate();
  useEffect(() => {
    if (finish) {
      const newLocation = location.pathname.replace('/staging', '');
      navigate(newLocation);
    }
  }, [finish, navigate]);

  return (
    <>
      <Card bg={'secondary.300'}>
        <CardBody>
          <Stack divider={<StackDivider />} spacing='4'>
            <Box>
              <Heading size='xs' textTransform='uppercase'>
                Origin
              </Heading>
              <Editable defaultValue={origin || originValue.content}>
                <EditablePreview />
                <EditableTextarea onChange={(e) => handleOriginChange('Origin', e.target.value)} />
              </Editable>
            </Box>
            {references?.map((reference) => (
              <Box key={reference.name}>
                <Heading size='xs' textTransform='uppercase'>
                  {reference.name}
                </Heading>
                <Stack>
                  {reference.content?.map((ct, index) => (
                    <Box key={ct}>
                      <Editable defaultValue={ct}>
                        <Mark mr={4}>{`${index + 1}`}.</Mark>
                        <EditablePreview />
                        <EditableTextarea
                          onChange={(e) =>
                            handelReferenceChanges(reference.name, e.target.value, index)
                          }
                        />
                      </Editable>
                    </Box>
                  ))}
                </Stack>
              </Box>
            ))}
            {isEditing ? (
              <ButtonGroup>
                <IconButton size={'sm'} icon={<CheckIcon />} aria-label='' onClick={handleSubmit} />
                <IconButton
                  onClick={() => setIsEditing(false)}
                  size={'sm'}
                  icon={<CloseIcon />}
                  aria-label=''
                />
              </ButtonGroup>
            ) : null}
          </Stack>
        </CardBody>
      </Card>
    </>
  );
};
