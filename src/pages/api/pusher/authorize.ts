import { NextApiRequest, NextApiResponse } from "next";
import pusher from "~/server/lib/pusherServer";
import { getUser } from "~/pages/api/utils";
import { prisma } from "~/server/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // TODO: Abstract this out or remove this if unnecesarry.
  if (req.method === "OPTIONS") {
    // Pre-flight request. Reply successfully:
    res.status(200).end();
    return;
  }

  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;

  console.log("AUTHORIZING");
  const user = await getUser(req);
  if (!user) {
    res.status(401).send("Unauthorized");
    return;
  }

  // To validate, we can check if the user is assigned to that channel in db.
  // We are not doing it rn, because we are prioritizing speed at the cost
  // of security.
  const isAssigned = prisma.rRChatQueue.findFirst({
    where: {
      userId: user.id,
      channel: channel,
    },
  });

  if (!isAssigned) {
    res.status(401).send("Unauthorized");
    return;
  }

  const presenceData = {
    user_id: user.id,
    user_info: { username: user.username!, bio: user.bio, image: user.image },
  };

  const authResponse = pusher.authorizeChannel(socketId, channel, presenceData);
  res.send(authResponse);
}
