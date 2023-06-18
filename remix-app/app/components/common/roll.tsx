import type { RollProps } from '~/routes/__app/tripitaka/$sutraId';
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
import { AppContext } from '~/routes/__app';
import { RoleType } from '~/types';
export function Roll(props: RollProps) {
  const actionData = useActionData<{ intent: Intent; data: string }>();
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
        w={400}
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
      <FormModal
        value={Intent.CREATE_ROLL_META}
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
              <FormLabel>{props.subtitle}</FormLabel>
              <Input type='text' name='subtitle' />
            </FormControl>
            <FormControl>
              <FormLabel>{props.category}</FormLabel>
              <Input type='text' name='category' />
            </FormControl>
            <Input name='SK' value={props.SK} readOnly hidden />
            <Input name='PK' value={props.PK} readOnly hidden />
            <Input name='origin_rollId' value={props.SK} readOnly hidden />
          </Box>
        }
      />
    </LinkBox>
  );
}
