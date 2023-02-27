import { Flex, Box, Button, Heading, HStack, Select, Divider, useToast } from '@chakra-ui/react';
import { Form, useActionData, useLoaderData, useTransition } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import type { ActionArgs } from '@remix-run/node';
import { getSutrasByLangAndVersion } from '~/models/sutra';
import { LangCode } from '~/types';
import { getRollsBySutraId } from '~/models/roll';
import { Intent } from '~/types/common';
import { useEffect, useState } from 'react';
import { handleIsSutraRollComplete, handleMarkRollComplete } from '~/services/__app/management';
export async function loader({ request }: ActionArgs) {
  // TODO: match user profile
  const originSutras = await getSutrasByLangAndVersion(LangCode.EN, 'V1');
  const result = await Promise.all(
    originSutras.map(async (sutra) => {
      const rolls = await getRollsBySutraId(sutra.SK);
      return {
        value: sutra.title,
        key: sutra.SK,
        rolls: rolls.map((roll) => ({ key: roll.SK ?? '', value: roll.subtitle })),
      };
    })
  );
  const sutras = result.reduce((acc, cur) => {
    const obj = { key: cur.key, value: cur.value };
    acc.push(obj);
    return [...acc];
  }, [] as { key: string; value: string }[]);
  const rolls = result.reduce((acc, cur) => {
    acc[cur.key] = cur.rolls;
    return acc;
  }, {} as Record<string, { key: string; value: string }[]>);
  return json({
    rolls,
    sutras,
  });
}

export async function action({ request }: ActionArgs) {
  const formdata = await request.formData();
  const entryData = Object.fromEntries(formdata.entries());
  const roll = entryData.roll as string;
  const sutra = entryData.sutra as string;
  if (entryData.intent === Intent.MARK_ROLL_COMPLETE) {
    const result = await handleIsSutraRollComplete({ sutra, roll });
    if (!result.isCompleted) {
      if (result.type === 'comment') {
        return json({ error: 'Not all comments resolved, please resolve comments first' });
      }
      if (result.type === 'paragraph') {
        return json({
          error: 'Not all paragraphs translated, please complete all paragraph first',
        });
      }
    } else {
      await handleMarkRollComplete({ sutra, roll });
    }
  }
  return redirect(`/sutra/${sutra}/${roll}`);
}

export default function ManagementRoute() {
  const { rolls, sutras } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const toast = useToast();
  useEffect(() => {
    if (actionData && 'error' in actionData) {
      toast({
        title: 'Oops',
        description: `${actionData.error}`,
        status: 'warning',
        duration: 4000,
        position: 'top',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);
  const transaction = useTransition();
  const isSubmit = Boolean(transaction.submission);
  const [sutra, setSutra] = useState<string>('');
  const [roll, setRoll] = useState<string>('');
  if (rolls) {
    return (
      <Flex p={10} background='secondary.800' w='100%' flexDir='column'>
        <Heading as='h5' size={'md'}>
          Sutra management
        </Heading>
        <Divider mt={4} mb={4} borderColor={'primary.300'} />
        <Box mt={10}>
          <Form method='post'>
            <HStack spacing={8}>
              <Select
                flex={3}
                placeholder='Select a sutra'
                name='sutra'
                colorScheme={'primary'}
                onChange={(e) => setSutra(e.target.value)}
              >
                {sutras.map((sutra) => (
                  <option key={sutra.key} value={sutra.key}>
                    {sutra.value}
                  </option>
                ))}
              </Select>
              <Select
                flex={3}
                placeholder='Select a roll'
                name='roll'
                colorScheme={'primary'}
                onChange={(e) => setRoll(e.target.value)}
              >
                {rolls[sutra]?.map((roll) => (
                  <option key={roll.key} value={roll.key}>
                    {roll.value}
                  </option>
                ))}
              </Select>
              <Button
                flex={1}
                type='submit'
                name='intent'
                value={Intent.MARK_ROLL_COMPLETE}
                colorScheme={'blue'}
                disabled={!(Boolean(sutra) && Boolean(roll))}
                isLoading={isSubmit}
              >
                complete
              </Button>
            </HStack>
          </Form>
        </Box>
      </Flex>
    );
  }
  return (
    <Box my={8} textAlign='left'>
      Not Defined
    </Box>
  );
}
