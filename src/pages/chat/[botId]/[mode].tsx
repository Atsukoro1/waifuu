import { ChatMessage } from "~/components/Chat/ChatMessage";
import { ChatTypingIndicator } from "~/components/Chat/ChatTypingIndicator";
import { Image, ScrollShadow } from "@nextui-org/react";
import { RiSendPlane2Fill } from "react-icons/ri";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import useBotChat from "~/use-hooks/useBotChat";
import { BotMode } from "@prisma/client";
import Page from "~/components/Page";
import Skeleton from "react-loading-skeleton";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ShareDropdown } from "~/components/Chat/ShareDropdown";
import { SettingsDropdown } from "~/components/Chat/SettingsDropdown";
import { useBot } from "~/use-hooks/useBot";
import { useMemo } from "react";

const Chat = () => {
  const router = useRouter();
  const botId = router.query.botId as string | undefined;
  const mode = (router.query.mode as string | undefined)?.toUpperCase();

  const { data: session } = useSession();
  const { data: bot } = useBot(botId, mode, router.isReady);
  const chat = useBotChat(botId, mode as BotMode, router.isReady);

  const [chatParent] = useAutoAnimate();

  const chatMessages = useMemo(() => {
    return chat.messages.map((message, index) => {
      const botName = bot?.name || "Them";
      const userName = session?.user?.name || "You";

      return (
        <ChatMessage
          key={message.id}
          author={{
            bot: message.role === "BOT",
            name: message.role === "BOT" ? botName : userName,
            avatar: "/assets/default_user.jpg",
          }}
          message={message.content}
        />
      );
    });
  }, [chat.messages, bot, session]);

  return (
    <Page protected={true} metaTitle={bot?.name || "Loading..."}>
      <Image
        alt="background"
        loading="eager"
        src={"/assets/background.png"}
        className="fixed left-0 top-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      <Image
        alt="background"
        loading="eager"
        src={"/assets/character.png"}
        className="fixed bottom-0 left-0 left-[50%] h-[800px] w-full max-w-[500px] translate-x-[-50%] object-cover"
        width={1920}
        height={1080}
      />
      <div className="fixed left-0 top-0 z-20 h-full w-full bg-gradient-to-b from-transparent via-black/70 to-black" />

      <div className="fixed z-30 w-full">
        <div className="mx-auto mt-5 flex w-[75%] flex-row rounded-lg bg-black bg-opacity-80 p-3">
          <div>
            <Image
              height={50}
              width={50}
              loading="eager"
              src={"/assets/default_user.jpg"}
              alt="botavatar"
            />
          </div>

          <div className="ml-3">
            <h3 className="text-white">{bot?.name || <Skeleton />}</h3>
            <h6 className="text-gray-400">@fauna_fyi</h6>
          </div>

          <div className="align-center mx-auto mr-2 flex flex-row gap-2">
            <SettingsDropdown />
            <ShareDropdown />
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="fixed bottom-6 left-[50%] z-30 flex translate-x-[-50%] flex-col gap-6">
          <ScrollShadow className="flex h-32 flex-col gap-7 overflow-scroll overflow-x-visible scrollbar scrollbar-track-transparent scrollbar-thumb-gray-700">
            <div ref={chatParent}>{chatMessages}</div>

            {chat.loadingReply && <ChatTypingIndicator />}
          </ScrollShadow>

          <div className="mx-auto flex w-[310px] flex-row gap-2 sm:w-[400px] md:w-[500px] lg:w-[700px]">
            <input
              placeholder="Your message..."
              className="w-full rounded-lg border-1 border-white bg-transparent p-3 text-white outline-none"
              type="text"
            />

            <button className="w-13 h-13 rounded-lg bg-white p-2">
              <RiSendPlane2Fill size={30} color="black" />
            </button>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default Chat;
