import type { CreatedType, Sutra as TSutra } from '~/types';
import {
  LinkBox,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Heading,
  Text,
  LinkOverlay,
  CardFooter,
  Box,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { Link, useActionData } from '@remix-run/react';
import { FormModal } from './modal';
import { Intent } from '~/types/common';
import { useEffect } from 'react';
export interface SutraProps extends CreatedType<TSutra> {
  slug: string;
  firstTime: boolean;
}
export function Sutra(props: SutraProps) {
  const actionData = useActionData<{ intent: Intent; data: string }>();
  const { slug, category, title, translator, firstTime } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    if (actionData?.intent === Intent.CREATE_SUTRA_META && actionData?.data) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);
  const handleClick = () => {
    onOpen();
  };
  return (
    <LinkBox as='article' key={slug}>
      <Card
        background='secondary.500'
        w={800}
        h={'100%'}
        borderRadius={12}
        boxShadow='0 12px 12px 0 rgba(0, 0, 0, 0.05)'
        onClick={firstTime ? () => handleClick() : undefined}
      >
        <CardHeader>
          <Heading size='md'>
            <Badge colorScheme='green' variant='solid'>
              <Text fontSize={'md'}>{category}</Text>
            </Badge>
          </Heading>
        </CardHeader>
        <CardBody>
          <LinkOverlay as={firstTime ? Box : Link} to={slug}>
            <Text as='b' fontSize='3xl'>
              {title}
            </Text>
          </LinkOverlay>
        </CardBody>
        <CardFooter>
          <Text>{translator}</Text>
        </CardFooter>
      </Card>
      <FormModal
        value={Intent.CREATE_SUTRA_META}
        isOpen={isOpen}
        onClose={onClose}
        header='Please translate following metaData first'
        body={
          <Box>
            <FormControl>
              <FormLabel>{props.title}</FormLabel>
              <Input type='text' name='title' />
            </FormControl>
            <FormControl>
              <FormLabel>{props.translator}</FormLabel>
              <Input type='text' name='translator' />
            </FormControl>
            <FormControl>
              <FormLabel>{props.category}</FormLabel>
              <Input type='text' name='category' />
            </FormControl>
            <FormControl>
              <FormLabel>{props.dynasty}</FormLabel>
              <Input type='text' name='dynasty' />
            </FormControl>
            <Input name='SK' value={props.SK} readOnly hidden />
            <Input name='PK' value={props.PK} readOnly hidden />
            <Input name='origin_sutraId' value={props.SK} readOnly hidden />
          </Box>
        }
      />
    </LinkBox>
  );
}
