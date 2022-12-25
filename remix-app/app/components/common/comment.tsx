import { Text, Tag, Input, Select, Textarea, VStack } from '@chakra-ui/react';
import { useLocation } from '@remix-run/react';
type CommentProps = {
  selectedText?: string;
  users: string[];
  paragraphId: string;
  start?: number;
  end?: number;
};
export const Comment = (props: CommentProps) => {
  const { pathname } = useLocation();

  const [_, __, sutraId, rollId] = pathname?.split('/');
  const { selectedText, start, end, users, paragraphId } = props;
  return (
    <VStack spacing={4} justifyContent={'flex-start'}>
      <Text>
        The text you have selected <Tag>{selectedText}</Tag>
      </Text>
      <Select placeholder="User you want to ping" name="targets" defaultValue={'ALL'}>
        {users?.map((user) => (
          <option key={user} value={user}>
            {user}
          </option>
        ))}
      </Select>
      <Select placeholder="Priority" name="priority" defaultValue={'Low'}>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </Select>
      <Textarea placeholder="add your comments here" name="comment" />
      <Input hidden readOnly name="start" value={start} />
      <Input hidden readOnly name="end" value={end} />
      <Input hidden readOnly name="content" value={selectedText} />
      <Input hidden readOnly name="path" value={pathname} />
      <Input hidden readOnly name="sutraId" value={sutraId} />
      <Input hidden readOnly name="rollId" value={rollId} />
      <Input hidden readOnly name="paragraphId" value={paragraphId} />
    </VStack>
  );
};
