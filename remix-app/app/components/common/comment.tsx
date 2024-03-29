import { Text, Tag, Input, Select, Textarea, VStack } from '@chakra-ui/react';
import { useLocation } from '@remix-run/react';
import { useContext } from 'react';
import { AppContext } from '~/routes/__app';
type CommentProps = {
  selectedText?: string;
  paragraphId: string;
  start?: number;
  end?: number;
  json: string;
};
export const Comment = (props: CommentProps) => {
  const { pathname } = useLocation();
  const { allUsers } = useContext(AppContext);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, __, sutraId, rollId] = pathname?.split('/') ?? [];
  const { selectedText, start, end, paragraphId, json } = props;
  return (
    <VStack spacing={4} justifyContent={'flex-start'}>
      <Text>
        The text you have selected <Tag>{selectedText}</Tag>
      </Text>
      <Select placeholder='User you want to ping' name='ping' defaultValue={'ALL'}>
        {allUsers?.map((user) => (
          <option key={user.SK} value={user.SK}>
            {user.username}
          </option>
        ))}
      </Select>
      <Select placeholder='Priority' name='priority' defaultValue={'1'}>
        <option value='1'>Low</option>
        <option value='2'>Medium</option>
        <option value='3'>High</option>
      </Select>
      <Textarea placeholder='add your comments here' name='comment' />
      <Input hidden readOnly name='start' value={start} />
      <Input hidden readOnly name='end' value={end} />
      <Input hidden readOnly name='content' value={selectedText} />
      <Input hidden readOnly name='path' value={pathname} />
      <Input hidden readOnly name='sutraId' value={sutraId} />
      <Input hidden readOnly name='rollId' value={rollId} />
      <Input hidden readOnly name='paragraphId' value={paragraphId} />
      <Input hidden readOnly name='json' value={json} />
    </VStack>
  );
};
