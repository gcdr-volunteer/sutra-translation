import { useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

export const useGPTTranslation = (props: { socketio: string }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [socketUrl, setSocketUrl] = useState(props.socketio);
  const [translation, setTranslation] = useState<string>('');

  const { lastMessage, readyState, sendJsonMessage } = useWebSocket(socketUrl, {
    share: false,
    shouldReconnect: (closeEvent) => true,
  });

  const sendMessage = (obj: unknown) => {
    setTranslation('');
    sendJsonMessage(obj);
  };
  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      if (lastMessage !== null) {
        setTranslation((prev) => {
          if (prev.endsWith(' ')) {
            return prev + lastMessage.data;
          }
          if (lastMessage.data.startsWith(' ')) {
            return prev + lastMessage.data;
          }
          return `${prev} ${lastMessage.data}`;
        });
      }
    }
  }, [lastMessage, readyState]);

  return { translation, sendMessage, isReady: readyState === ReadyState.OPEN };
};
