import { PropsWithChildren } from "react";
import { Button } from "@nextui-org/react";
import { BiArrowBack } from "react-icons/bi";
import { useRouter } from "next/router";
import { twMerge } from "tailwind-merge";
import { UserDropdown } from "./User/UserDropdown";

export type HeaderProps = {
  /** Null for no back button, "previous" for the last opened page, and string for a certain path. Default: "previous" */
  back?: string | null | "previous";
  /** Triggered when the back button is clicked. Can be used for cleanups. */
  onBack?: () => void;
};

/**
 * Unifies page headers. Contains a back button and page title.
 * Back button can be configured to either navigate to a path, navigate to the previous page ("previous"),
 * or do nothing (null).
 */
export default function Header(props: PropsWithChildren<HeaderProps>) {
  const back = props.back === undefined ? "previous" : props.back;
  const router = useRouter();

  function handleBackClick() {
    if (back === null) return;
    else if (back === "previous") router.back();
    else {
      router.push(back);
      // TODO: Remove the last path from history to not confuse mobile app back button (/swipe)?
    }

    if (props.onBack) props.onBack();
  }

  return (
    <div
      className={
        "z-[100] h-16 fixed -top-1 left-0 right-0 p-2 " +
        "backdrop-blur-xl bg-background/50 border-b-1 border-foreground-300"
      }
    >
      <div className={"justify-center flex flex-row h-full items-center"}>
        <Button
          variant={"light"}
          isIconOnly
          onClick={handleBackClick}
          className={twMerge("-mr-8 p-0", back === null && "hidden")}
        >
          <BiArrowBack size={25} />
        </Button>
        <h1 className={"my-auto mx-auto text-center title-lg"}>
          {props.children}
        </h1>
        <UserDropdown />
      </div>
    </div>
  );
}
