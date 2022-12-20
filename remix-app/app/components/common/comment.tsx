import { Text, Tag, Input, Select, Textarea, VStack } from '@chakra-ui/react';
import { useLocation } from '@remix-run/react';
type CommentProps = {
  selectedText?: string;
  start?: number;
  end?: number;
  users: string[];
};
export const Comment = (props: CommentProps) => {
  const { pathname } = useLocation();

  const [_, __, sutraId, rollId] = pathname?.split('/');
  const { selectedText, start, end, users } = props;
  return (
    <VStack spacing={4} textAlign={'left'}>
      <Text>
        The text you have selected <Tag>{selectedText}</Tag>
      </Text>
      <Select placeholder="User you want to ping" name="targets">
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
      <Input hidden name="start" value={start} />
      <Input hidden name="end" value={end} />
      <Input hidden name="content" value={selectedText} />
      <Input hidden name="path" value={pathname} />
      <Input hidden name="sutraId" value={sutraId} />
      <Input hidden name="rollId" value={rollId} />
    </VStack>
  );
};
