import { ContactUsForm } from "@components/ContactUsForm";

import { Trans, t } from "@lingui/macro";
import { Card, CardBody } from "@nextui-org/card";

import { CombinedPage } from "@components/CombinedPage";
import { Link } from "@nextui-org/react";
import { FiMail } from "react-icons/fi";
import { PageDescription } from "src/components/PageDescription";
import { PageTitle } from "src/components/PageTitle";

export default () => {
  return (
    /*TODO: Description*/
    <CombinedPage disableXPadding title={t`Contact us`} description={""}>
      <div className="container mx-auto max-w-5xl sm:px-10 lg:px-0 lg:mt-20">
        <div className="flex flex-col items-center lg:items-start lg:flex-row gap-20 justify-between sm:px-4">
          <div>
            <PageTitle className={"text-left"} center={false}>
              <Trans>Contact us</Trans>
            </PageTitle>
            <PageDescription>
              <Trans>
                Got a problem? A question? Or just want to say hi? We are here for you.
              </Trans>
            </PageDescription>
            <Socials className={"mt-8"} />
          </div>

          <Card className={"w-full max-w-[400px]"}>
            {/*TODO: Logo and name*/}
            <CardBody>
              <ContactUsForm />
            </CardBody>
          </Card>
        </div>
      </div>
    </CombinedPage>
  );
};

function Socials(props: { className?: string }) {
  return (
    <div className={`${props.className} text-lg`}>
      {/*TODO: EXtract out the mail into constants perhaps.*/}
      <ContactInfoItem icon={<FiMail />} href="mailto:info@waifuu.com">
        info@waifuu.com
      </ContactInfoItem>

      {/*TODO: Add socials.*/}
      {/*<ContactInfoItem icon={<FaInstagram />} href="https://www.instagram.com/vasenkecteni">
        Instagram
      </ContactInfoItem>

      <ContactInfoItem icon={<FaFacebook />} href="https://www.facebook.com/vasenkecteni">
        Facebook
      </ContactInfoItem>

      <ContactInfoItem
        icon={<FaLinkedin />}
        href="https://www.linkedin.com/in/mat%C4%9Bj-pl%C5%A1ek-64906419b/"
      >
        LinkedIn
      </ContactInfoItem>*/}
    </div>
  );
}

function ContactInfoItem(props: {
  icon: JSX.Element;
  children: string;
  href?: string;
}) {
  return (
    <div className="flex flex-row items-center gap-4">
      {props.icon}
      <Link href={props.href}>{props.children}</Link>
    </div>
  );
}
