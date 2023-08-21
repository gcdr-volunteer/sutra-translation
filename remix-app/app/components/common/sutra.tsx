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
import { Link, useActionData, useLocation } from '@remix-run/react';
import { FormModal } from './modal';
import { Intent } from '~/types/common';
import { useEffect } from 'react';
import { useSetTheme } from '~/hooks';
import { Can } from '~/authorisation';
export interface SutraProps extends CreatedType<TSutra> {
  slug: string;
  firstTime: boolean;
}
export function Sutra(props: SutraProps) {
  const actionData = useActionData<{ intent: Intent; data: string }>();
  const location = useLocation();
  const { slug, category, title, translator, firstTime } = props;
  const isOpenMetaModal = firstTime && location?.pathname.includes('tripitaka');
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

  const { fontFamilyOrigin } = useSetTheme();
  return (
    <LinkBox as='article' key={slug}>
      <Card
        background='secondary.500'
        borderRadius={12}
        boxShadow='0 12px 12px 0 rgba(0, 0, 0, 0.05)'
        onClick={isOpenMetaModal ? () => handleClick() : undefined}
      >
        <CardHeader>
          <Heading size='md'>
            <Badge colorScheme='green' variant='solid'>
              <Text fontSize={'md'}>{category}</Text>
            </Badge>
          </Heading>
        </CardHeader>
        <CardBody>
          <LinkOverlay as={isOpenMetaModal ? Box : Link} to={slug}>
            <Text as='b' fontSize='3xl' fontFamily={fontFamilyOrigin}>
              {title}
            </Text>
          </LinkOverlay>
        </CardBody>
        <CardFooter>
          <Text fontFamily={fontFamilyOrigin}>{translator}</Text>
        </CardFooter>
      </Card>
      <Can I='Create' this='Paragraph'>
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
      </Can>
    </LinkBox>
  );
}
