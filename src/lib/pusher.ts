import PusherServer from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher instance (triggers events to clients)
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID || "2180555",
  key: process.env.PUSHER_KEY || "8835914c52a37305cfd4",
  secret: process.env.PUSHER_SECRET || "d4d57de030034f666943",
  cluster: process.env.PUSHER_CLUSTER || "ap2",
  useTLS: true,
});

// Client-side Pusher instance (subscribes to events in browser)
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY || "8835914c52a37305cfd4",
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2",
  }
);
