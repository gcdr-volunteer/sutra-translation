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
import { useActionData, useSubmit } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { Intent } from '~/types/common';
import type { CreatedType, Paragraph, Reference } from '../../types';
import { useTransitionState } from '../../hooks';

export const OriginReference = ({
  origin,
  SK,
  selectedParagraph,
}: {
  origin: string;
  SK: string;
  selectedParagraph: string;
}) => {
  const { isSubmitting, isLoading } = useTransitionState();
  return (
    <Radio ml={-6} borderColor={'primary.300'} value={SK} disabled={isSubmitting || isLoading}>
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

export const ReferencePairForStaging = (props: {
  origin: string;
  references: Reference[];
  sutra?: string;
  roll?: string;
}) => {
  const { origin, references, sutra, roll } = props;

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
          <ReferenceElement references={references} sutra={sutra} roll={roll} />
        </Stack>
      </CardBody>
    </Card>
  );
};

export const ReferenceElement = ({
  references,
  isUpdate = false,
  sutra = '',
  roll = '',
}: {
  references: Reference[];
  sutra?: string;
  roll?: string;
  isUpdate?: boolean;
}) => {
  const [values, setValues] = useState<Reference[]>([...references]);

  const [isEditing, setIsEditing] = useState(false);

  const handelReferenceChanges = (index: number, content: string) => {
    const newValues = [...values];
    newValues[index]['content'] = content;
    setValues(newValues);
    setIsEditing(true);
  };

  const actionData = useActionData();

  useEffect(() => {
    if (actionData?.intent === Intent.UPDATE_REFERENCE && !actionData?.errors) {
      setIsEditing(false);
    }
    if (actionData?.intent === Intent.CREATE_REFERENCE && !actionData?.errors) {
      setIsEditing(false);
    }
  }, [actionData]);

  const submit = useSubmit();
  const handleSubmit = () => {
    let params = {};
    if (isUpdate) {
      params = {
        intent: Intent.UPDATE_REFERENCE,
        content: JSON.stringify(values),
      };
    } else {
      params = {
        intent: Intent.CREATE_REFERENCE,
        content: JSON.stringify(values),
        sutra,
        roll,
      };
    }
    submit(params, { method: 'post' });
  };

  return (
    <Box>
      {references.map((value, i) => (
        <Box key={i}>
          <Heading size='xs' textTransform='uppercase' mt={4}>
            {value.name}
          </Heading>
          <Flex minH={'65px'} justify={'flex-start'} align={'center'}>
            <Editable defaultValue={value.content || 'Click to edit'} w={'100%'}>
              <EditablePreview />
              <EditableTextarea
                height={'65px'}
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
            onClick={() => {
              setIsEditing((prev) => {
                return true;
              });
            }}
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
            <ReferenceElement references={references} isUpdate={true} />
          </Stack>
        </CardBody>
      </Card>
    </>
  );
};
