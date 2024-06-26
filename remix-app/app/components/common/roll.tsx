import {
  LinkBox,
  Card,
  CardHeader,
  CardBody,
  Heading,
  LinkOverlay,
  Text,
  useDisclosure,
  Box,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { Link, useActionData, useLocation } from '@remix-run/react';
import { FormModal } from './modal';
import { Intent } from '~/types/common';
import { useContext, useEffect } from 'react';
import { useSetTheme } from '~/hooks';
import { AppContext } from '~/routes/_app';
import { RoleType } from '~/types';
import { Can } from '~/authorisation';
import type { RollProps } from '../../routes/_app.tripitaka.$sutraId._index';
export function Roll(props: RollProps) {
  const actionData = useActionData<{ intent: Intent; payload: string }>();
  const { currentUser } = useContext(AppContext);
  const location = useLocation();
  const { slug, subtitle, title, firstTime } = props;
  const isOpenMetaModal =
    firstTime &&
    !currentUser?.roles.includes(RoleType.Manager) &&
    !currentUser?.roles.includes(RoleType.Assistor) &&
    location?.pathname.includes('tripitaka');
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    if (actionData?.intent === Intent.CREATE_ROLL_META && actionData?.payload) {
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
        w={400}
        minH={200}
        borderRadius={12}
        boxShadow='0 12px 12px 0 rgba(0, 0, 0, 0.05)'
        onClick={isOpenMetaModal ? handleClick : undefined}
      >
        <CardHeader>
          <Heading size='lg' fontFamily={fontFamilyOrigin}>
            {title}
          </Heading>
        </CardHeader>
        <CardBody>
          <LinkOverlay as={isOpenMetaModal ? Box : Link} to={slug}>
            <Text fontFamily={fontFamilyOrigin}>{subtitle}</Text>
          </LinkOverlay>
        </CardBody>
      </Card>
      <Can I='Create' this='Paragraph'>
        <FormModal
          value={Intent.CREATE_ROLL_META}
          isOpen={isOpen}
          onClose={onClose}
          header='Please translate following metaData first'
          body={
            <Box>
              <FormControl>
                <FormLabel>
                  {props.title}
                  <span style={{ color: 'red' }}>*</span>
                </FormLabel>
                <Input type='text' name='title' />
              </FormControl>
              <FormControl>
                <FormLabel>
                  {props.subtitle}
                  <span style={{ color: 'red' }}>*</span>
                </FormLabel>
                <Input type='text' name='subtitle' />
              </FormControl>
              <FormControl>
                <FormLabel>
                  {props.category}
                  <span style={{ color: 'red' }}>*</span>
                </FormLabel>
                <Input type='text' name='category' />
              </FormControl>
              <Input name='SK' value={props.SK} readOnly hidden />
              <Input name='PK' value={props.PK} readOnly hidden />
              <Input name='origin_rollId' value={props.SK} readOnly hidden />
            </Box>
          }
        />
      </Can>
    </LinkBox>
  );
}
