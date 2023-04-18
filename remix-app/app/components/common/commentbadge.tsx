import { Link } from '@remix-run/react';
import { AiFillMessage } from 'react-icons/ai';
import { Avatar, AvatarBadge, Box } from '@chakra-ui/react';
type CommentBadgesProps = {
  router: `${string}/${string}`;
  showIndicator: boolean;
};
export const CommentBadge = (props: CommentBadgesProps) => {
  const { router, showIndicator } = props;
  // const lastMessage = lastMessages.find((message) => message.parentId === rootCommentId);
  // const [notifications, setNotifications] = useState<Record<string, boolean>>({});
  // const { currentUser } = useContext(AppContext);
  // const message = useEventSource('/chat/subscribe', { event: 'new-message' });

  // useEffect(() => {
  //   if (message) {
  //     const msgObj = JSON.parse(message) as { id: string; username: string };
  //     if (msgObj.username !== currentUser?.username && msgObj.id === rootCommentId) {
  //       setNotifications((prev) => ({ ...prev, [msgObj.id]: true }));
  //     } else {
  //       setNotifications((prev) => ({ ...prev, [msgObj.id]: false }));
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [message]);

  // useEffect(() => {
  //   if (rootCommentId) {
  //     if (lastMessage?.createdBy !== currentUser?.SK) {
  //       setNotifications((prev) => ({ ...prev, [rootCommentId]: true }));
  //     } else if (lastMessage?.id === rootCommentId) {
  //       setNotifications((prev) => ({ ...prev, [rootCommentId]: false }));
  //     } else {
  //       setNotifications((prev) => ({ ...prev, [rootCommentId]: false }));
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [rootCommentId]);

  return (
    <Box pos={'absolute'} top={4} right={{ md: '-20vw', lg: '-23vw' }}>
      <Link to={router}>
        <Avatar borderRadius={10} bg={'primary.300'} icon={<AiFillMessage />}>
          {showIndicator ? <AvatarBadge boxSize='1.25em' bg='green.500' /> : null}
        </Avatar>
      </Link>
    </Box>
  );
};
