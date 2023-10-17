import { useRouter } from "next/router";
import { IconType } from "react-icons";
import { AiOutlineUser } from "react-icons/ai";
import { useEffect, useState } from "react";
import { paths } from "@/lib/paths";
import { twMerge } from "tailwind-merge";
import { Button } from "@nextui-org/react";
import { RiSearch2Fill, RiSearch2Line } from "react-icons/ri";
import { IoChatbubbles, IoChatbubblesOutline } from "react-icons/io5";
import { normalizePath } from "@/utils/utils";
// import svg assets/icons/history.svg

// Mapping of paths and their icons.
type ButtonProp = {
  path: string;
  title: string;
  icon: IconType;
  iconFilled: IconType;
  pathExactMatch?: boolean;
};

const buttons: ButtonProp[] = [
  {
    path: paths.discover,
    title: "Discover",
    icon: RiSearch2Line,
    iconFilled: RiSearch2Fill,
  },
  {
    path: paths.RR,
    title: "Roulette",
    icon: IoChatbubblesOutline,
    iconFilled: IoChatbubbles,
  },
  {
    path: paths.profile,
    title: "Profile",
    icon: AiOutlineUser,
    iconFilled: AiOutlineUser,
  },
];

/**
 * The action bar on the bottom, which allows to switch pages.
 * @param props
 * @constructor
 */
export const ActionBar = (props: {}) => {
  const [activeButtId, setActiveButtId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Make the path that starts with the current path and matches the largest part of it active.
    // Example: If we have paths "hi.com/user/21" and "hi.com/user", and the current path is "hi.com/user/21",
    // then the active path should be "hi.com/user/21".'
    let selectedButt: ButtonProp | null = null;
    const currPathname = normalizePath(router.pathname);

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i]!;
      const pathname = normalizePath(button.path);

      if (button.pathExactMatch && pathname === currPathname) {
        selectedButt = button;
        break;
      }

      if (
        currPathname.startsWith(pathname) &&
        (selectedButt?.path?.length ?? 0) < pathname.length
      )
        selectedButt = button;
    }
    setActiveButtId(selectedButt?.title ?? null);
  }, [router.pathname]);

  return (
    <div
      className={
        "bg-default-50 min-h-max p-1 py-2 z-70 rounded-xl fixed left-2 right-2 bottom-2 border border-default-100 shadow"
      }
    >
      <div className={"flex flex-row justify-between items-center"}>
        {buttons.map((button) => {
          return (
            <ActionButton
              key={button.title}
              {...button}
              isActive={button.title === activeButtId}
            />
          );
        })}
      </div>
    </div>
  );
};

function ActionButton(props: ButtonProp & { isActive: boolean }) {
  const router = useRouter();

  function handleClick() {
    // TODO: Replace if in ionic app.
    router.push(props.path);
  }

  const transitionDuration = ""; // duration-100

  return (
    <div className={""}>
      <Button
        disableRipple={false}
        onPressStart={handleClick}
        className={twMerge(
          "m-0 bg-transparent hover:bg-none h-12",
          "flex flex-col items-center justify-center gap-0",
          props.isActive ? "text-foreground-900" : "text-foreground-400",
        )}
      >
        {props.isActive && (
          <props.iconFilled
            className={`flex-1 ${transitionDuration}`}
            size={26}
          />
        )}
        {!props.isActive && (
          <props.icon className={`flex-1 ${transitionDuration}`} size={26} />
        )}
        {
          <p className={`text-sm font-semibold ${transitionDuration}`}>
            {props.title}
          </p>
        }
      </Button>
    </div>
  );
}