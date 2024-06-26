import { useSession } from "@/providers/SessionProvider";
import { useFixLoadMoreScrollJitter } from "@components/BotChatContent/useFixLoadMoreScrollJitter";
import { useLoadMore } from "@components/BotChatContent/useLoadMore";
import { useScrollToLatest } from "@components/BotChatContent/useScrollToLatest";
import { ChatMessage } from "@components/bot-chat/ChatMessage";
import { ChatTypingIndicator } from "@components/bot-chat/ChatTypingIndicator";
import useBotChat from "@hooks/useBotChat";
import { makeDownloadUrl } from "@lib/utils";
import { Image, ScrollShadow } from "@nextui-org/react";
import { Bot } from "@prisma/client";
import { useRef } from "react";

export const BotChatContent = (props: {
  chat: ReturnType<typeof useBotChat>;
  bot?: Bot;
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useLoadMore({ containerRef, chat: props.chat });
  useScrollToLatest({ containerRef, bottomRef, chat: props.chat });
  useFixLoadMoreScrollJitter({ containerRef, chat: props.chat });

  const chat = props.chat;

  if (!props.bot) return <div />;

  return (
    <div>
      <Image
        className="z-0 w-full h-full object-cover fixed top-0"
        src={makeDownloadUrl(props.bot.backgroundImage)}
      />

      <div className="fixed left-0 bottom-14 md:w-full z-30">
        <ScrollShadow
          size={90}
          offset={-5} // fixes the shadow being cut off.
          ref={containerRef}
          className="flex md:w-[500px] mx-auto flex-col p-5 gap-5 h-[430px] w-full z-[30] overflow-scroll overscroll-auto pt-10 no-scrollbar"
        >
          <Messages chat={chat} bot={props.bot} />
          {chat.loadingReply && <ChatTypingIndicator className={"z-[30]"} />}

          <div ref={bottomRef} />
        </ScrollShadow>
      </div>
    </div>
  );
};

const Messages = (props: {
  chat: ReturnType<typeof useBotChat>;
  bot: Bot;
}) => {
  const { user } = useSession();
  const { chat } = props;

  return chat.messages
    .sort((a, b) => a.id - b.id)
    .map((message) => {
      const isBot = message.role === "BOT";
      const username = user?.name ?? "";

      return (
        <ChatMessage
          messageId={message.id}
          chatId={chat.id}
          key={message.id}
          className={"z-[10]"}
          author={{
            bot: isBot,
            name: isBot ? props.bot.name : username,
            avatar: isBot ? makeDownloadUrl(props.bot.avatar) : user?.image,
          }}
          message={message.content}
          mood={message.mood}
        />
      );
    });
};
