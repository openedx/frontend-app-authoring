import {
  useCallback, useEffect, useMemo, useRef,
} from 'react';
import { BroadcastChannel } from 'broadcast-channel';

const channelInstances = {};

export const getSingletonChannel = (name) => {
  if (!channelInstances[name]) {
    channelInstances[name] = new BroadcastChannel(name);
  }
  return channelInstances[name];
};

export const useBroadcastChannel = (channelName, onMessageReceived) => {
  const channel = useMemo(() => getSingletonChannel(channelName), [channelName]);
  const isSubscribed = useRef(false);

  useEffect(() => {
    if (!isSubscribed.current || process.env.NODE_ENV !== 'development') {
      // BroadcastChannel api from npm has minor difference from native BroadcastChannel
      // Native BroadcastChannel passes event to onmessage callback and to
      // access data we need to use `event.data`, but npm BroadcastChannel
      // directly passes data as seen below
      channel.onmessage = (data) => onMessageReceived(data);
    }
    return () => {
      if (isSubscribed.current || process.env.NODE_ENV !== 'development') {
        channel.close();
        isSubscribed.current = true;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const postMessage = useCallback(
    (message) => {
      channel?.postMessage(message);
    },
    [channel],
  );

  return {
    postMessage,
  };
};
