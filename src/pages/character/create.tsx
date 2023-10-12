import {
  Accordion,
  AccordionItem,
  Button,
  Card,
  Checkbox,
  Divider,
  Input,
  Select,
  SelectItem,
  Switch,
  Textarea,
} from "@nextui-org/react";
import { useMemo, useState } from "react";
import Page from "~/components/Page";
import { FileUpload } from "~/components/shared/FileUpload";
import { useForm, SubmitHandler } from "react-hook-form";
import { Visibility } from "@prisma/client";
import Router from "next/router";
import { api } from "~/utils/api";
import paths from "~/utils/paths";

type CreateInput = {
  title: string;
  description: string;
  visibility: Visibility;

  name: string;
  persona: string;
  dialogue: string;
  nsfw: boolean;
};

const CreateChatPage = () => {
  const [isSelected, setIsSelected] = useState(false);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [cover, setCover] = useState<string | undefined>(undefined);

  // Mood states
  const [sad, setSad] = useState<string | undefined>(undefined);
  const [happy, setHappy] = useState<string | undefined>(undefined);
  const [blushed, setBlushed] = useState<string | undefined>(undefined);
  const [neutral, setNeutral] = useState<string | undefined>(undefined);

  const moodInputs = [setSad, setHappy, setBlushed, setNeutral].map((func) => {
    return FileUpload({
      onSuccess: (data) => func(data.message[0]?.id),
      onError: () => func(undefined),
      onFileRemove: () => {},
      structure: "SQUARE",
    });
  });

  const createBot = api.bots.create.useMutation({
    onSuccess: (data) => {
      Router.push(paths.botChatMainMenu(data.id));
    },
  });

  const { register, handleSubmit } = useForm<CreateInput>();
  const submitHandler: SubmitHandler<CreateInput> = (data) => {
    createBot.mutateAsync({
      ...data,
      nsfw: data.nsfw ?? false,
      avatar,
      cover,
    });
  };

  const AvatarUpload = useMemo(
    () =>
      FileUpload({
        onSuccess: (data) => setAvatar(data.message[0]?.id),
        onError: () => setAvatar(undefined),
        onFileRemove: () => {},
        structure: "SQUARE",
      }),
    [],
  );

  const CoverUpload = useMemo(
    () =>
      FileUpload({
        onSuccess: (data) => setCover(data.message[0]?.id),
        onError: () => setCover(undefined),
        onFileRemove: () => {},
        structure: "SQUARE",
      }),
    [],
  );

  return (
    <Page title="Create a new character">
      <form onSubmit={handleSubmit(submitHandler)}>
        <Card>
          <div className="p-4">
            <h2 className="text-xl mb-4">About</h2>

            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-medium">Avatar</h3>
                {AvatarUpload}
              </div>

              <Input
                {...register("title")}
                isRequired
                type="text"
                label="Title"
              />

              <Textarea
                {...register("description")}
                isRequired
                type="text"
                label="Description"
              />

              <Select
                {...register("visibility")}
                label="Select visibility"
                isRequired
              >
                <SelectItem key={Visibility.PUBLIC} value={Visibility.PUBLIC}>
                  Public
                </SelectItem>
                <SelectItem key={Visibility.PRIVATE} value={Visibility.PRIVATE}>
                  Private
                </SelectItem>
                <SelectItem key={Visibility.LINK} value={Visibility.LINK}>
                  Only for friends
                </SelectItem>
              </Select>
            </div>

            <Divider className="mt-4 mb-4" />

            <h2 className="text-xl mb-4">Character's character</h2>

            <div className="flex flex-col gap-4">
              <Input
                {...register("name")}
                isRequired
                type="text"
                label="Name"
              />

              <Textarea
                {...register("persona")}
                isRequired
                label="Persona"
                labelPlacement="outside"
              />

              <Textarea
                {...register("dialogue")}
                isRequired
                label="Example dialogue"
                labelPlacement="outside"
              />

              <div className="flex flex-col gap-2">
                <Switch
                  {...register("nsfw")}
                  defaultChecked={false}
                  isSelected={isSelected}
                  onValueChange={setIsSelected}
                >
                  NSFW content
                </Switch>
                <p className="text-small text-default-500">
                  Character will produce content {!isSelected && "not"} suitable
                  for minors
                </p>
              </div>
            </div>

            <Divider className="mt-4 mb-4" />

            <h2 className="text-xl mb-3">Images</h2>
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-medium">Character image</h3>
                {CoverUpload}
              </div>
            </div>

            <Divider className="mt-4 mb-4" />

            <Accordion>
              <AccordionItem
                key="1"
                aria-label="Advanced mood settings"
                subtitle={
                  <>
                    <Checkbox /> Click to enable advanced mood settings
                  </>
                }
                title="Advanced mood settings"
              >
                <h2>Neutral mood</h2>
                {moodInputs[0]}
                <h2 className="mt-5">Sad mood</h2>
                {moodInputs[1]}
                <h2 className="mt-5">Angry mood</h2>
                {moodInputs[2]}
                <h2 className="mt-5">Blushed mood</h2>
                {moodInputs[3]}
              </AccordionItem>
            </Accordion>

            <div className="flex flex-row w-fit mx-auto mr-0 gap-2 mt-5">
              <Button color="primary" variant="bordered">
                Close
              </Button>
              <Button type="submit" color="primary">
                Create
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </Page>
  );
};

export default CreateChatPage;
