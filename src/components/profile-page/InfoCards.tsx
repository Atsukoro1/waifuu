import React, { PropsWithChildren } from "react";
import { Chip, Skeleton } from "@nextui-org/react";
import { twMerge } from "tailwind-merge";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { api } from "~/utils/api";
import { Bot } from ".prisma/client";
import Link from "next/link";
import paths from "~/utils/paths";
import { FaEye, FaHeart } from "react-icons/fa";

function InfoCard(
  props: PropsWithChildren<{
    isLoaded: boolean;
    title: string;
    className?: string;
  }>,
) {
  return (
    <Skeleton
      className={twMerge("rounded-xl", props.className)}
      isLoaded={props.isLoaded}
    >
      <Card>
        <CardHeader>
          <h4 className={"text-xl font-bold"}>{props.title}</h4>
        </CardHeader>
        <CardBody>{props.children}</CardBody>
      </Card>
    </Skeleton>
  );
}

export default function InfoCards(props: { username?: string }) {
  const { isInitialLoading, data: user } = api.users.getPublic.useQuery(
    { username: props.username! },
    { enabled: !!props.username },
  );

  return (
    <>
      <InfoCard isLoaded={!isInitialLoading} title={"Bio"} className={"mt-20"}>
        <p>
          {user?.bio || "This user has not set a bio yet. Check back later!"}
        </p>
      </InfoCard>

      <InfoCard isLoaded={!isInitialLoading} title={"Characters"}>
        {user?.bots && <BotList bots={user.bots} />}
        {!user?.bots && <p>This user has not created any characters yet :(</p>}
      </InfoCard>
    </>
  );
}

function BotList(props: { bots: Bot[] }) {
  console.log(props.bots);
  return (
    <Card className={""}>
      {props.bots?.map((bot) => (
        <Link href={paths.botChatMainMenu(bot.id)} key={bot.id}>
          <Card
            className={
              "relative flex flex-col gap-4 border border-gray-700 bg-zinc-800 p-2"
            }
          >
            <div className={"flex flex-row gap-3"}>
              <img
                className={"aspect-square h-16 w-16 rounded-xl"}
                src={bot.img!}
                alt={bot.name}
              />
              <div className={"flex max-w-xs flex-col"}>
                <p className={"line-clamp-1 text-lg font-bold"}>{bot.name}</p>
                <p className={"line-clamp-2"}>
                  {bot.description || "No description."}
                </p>
              </div>
            </div>
            <div className={"inline-flex gap-2"}>
              <Chip
                startContent={<FaHeart />}
                variant="faded"
                color="default"
                className={"px-3"}
              >
                Likes
              </Chip>
              <Chip
                startContent={<FaEye />}
                variant="faded"
                color="default"
                className={"px-3"}
              >
                Views
              </Chip>
            </div>
          </Card>
        </Link>
      ))}
    </Card>
  );
}