import { Flex, Text, Box, Button, VStack, HStack, Select } from '@chakra-ui/react';
import { Form } from '@remix-run/react';
import { assertAuthUser, authenticator } from '~/auth.server';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { fontFamilyList, fontFamilyPlaceholder, langCodeFullVersion } from '~/utils/contants';
import { useSetTheme } from '~/hooks';
import { AppContext } from '~/routes/_app';
import { useContext } from 'react';
import { json, redirect } from '@remix-run/node';
import { LangCode } from '../types';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await assertAuthUser(request);
  if (!user) {
    return redirect('/login');
  }
  return json({});
};

export async function action({ request }: ActionFunctionArgs) {
  await authenticator.logout(request, { redirectTo: '/login' });
}
export default function SettingRoute() {
  const { currentUser } = useContext(AppContext);
  const {
    fontSize,
    fontFamilyOrigin,
    fontFamilyTarget,
    setFontSize,
    setFontFamilyOrigin,
    setFontFamilyTarget,
  } = useSetTheme();

  return (
    <Flex p={10} background='secondary.800' w='100%' flexDir='column'>
      <VStack flex='auto'>
        <HStack justifyContent={'start'} h='100px'>
          <Text>{langCodeFullVersion[currentUser?.origin_lang ?? LangCode.ZH]}</Text>
          <Select
            onChange={(e) => setFontFamilyOrigin(e.target.value)}
            placeholder='Select font family'
          >
            {fontFamilyList[currentUser?.origin_lang ?? LangCode.ZH].map((ff) => (
              <option key={ff} value={ff}>
                {ff}
              </option>
            ))}
          </Select>
          <Text>{langCodeFullVersion[currentUser?.target_lang ?? LangCode.EN]}</Text>
          <Select
            onChange={(e) => setFontFamilyTarget(e.target.value)}
            placeholder='Select font family'
          >
            {fontFamilyList[currentUser?.target_lang ?? LangCode.EN].map((ff) => (
              <option key={ff} value={ff}>
                {ff}
              </option>
            ))}
          </Select>
          <Select onChange={(e) => setFontSize(e.target.value)} placeholder='Select font size'>
            <option value='sm'>Small</option>
            <option value='md'>Medium</option>
            <option value='lg'>Large</option>
            <option value='xl'>XLarge</option>
            <option value='2xl'>XXLarge</option>
            <option value='3xl'>XXXLarge</option>
          </Select>
        </HStack>
        <Flex flexDir={'row'} gap={4}>
          <Flex bg={'secondary.300'} flex={1} p={4} borderRadius={12} flexDir={'row'} w='100%'>
            <Text fontFamily={fontFamilyOrigin} fontSize={fontSize}>
              {fontFamilyPlaceholder[currentUser?.origin_lang || LangCode.ZH]}
            </Text>
          </Flex>
          <Flex bg={'secondary.200'} flex={1} p={4} borderRadius={12} flexDir={'row'} w='100%'>
            <Text fontFamily={fontFamilyTarget} fontSize={fontSize}>
              {fontFamilyPlaceholder[currentUser?.target_lang || LangCode.EN]}
            </Text>
          </Flex>
        </Flex>
      </VStack>
      <Box my={8} textAlign='left'>
        <Form method='post'>
          <Button colorScheme={'iconButton'} width='full' mt={4} type='submit'>
            Logout
          </Button>
        </Form>
      </Box>
    </Flex>
  );
}
