import "@/styles/globals.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import "filepond/dist/filepond.min.css";
import "react-loading-skeleton/dist/skeleton.css";
import "react-toastify/dist/ReactToastify.css";

import { api } from "@/lib/api";
import { Modal, ModalContent, NextUIProvider } from "@nextui-org/react";
import { type AppType } from "next/app";
import { useEffect } from "react";
import { SkeletonTheme } from "react-loading-skeleton";
import { ToastContainer } from "react-toastify";

import { SessionProvider } from "@/providers/SessionProvider";
import { useInitializeEarlyAccess } from "@/stores";
import Title from "@components/ui/Title";
import useIsMobile from "@hooks/useIsMobile";
import { useIsOnline } from "@hooks/useIsOnline";
import { getOrInitFirebaseApp, getOrInitFirebaseAuth } from "@lib/firebase";
import { initGlobalLocale } from "@lib/i18n";
import { i18n } from "@lingui/core";
import { Trans } from "@lingui/macro";
import { I18nProvider } from "@lingui/react";
import { Spinner } from "@nextui-org/spinner";
import { CustomHistoryProvider } from "@providers/CustomHistoryProvider";
import { MountPersistenceProvider } from "@providers/MountPersistenceProvider";
import { PersistedScrollPositionProvider } from "@providers/PersistedScrollPositionProvider";
import { getAnalytics } from "firebase/analytics";
import { useRouter } from "next/router";

initGlobalLocale();

const Waifuu: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  const router = useRouter();
  const isMobile = useIsMobile();
  useInitializeEarlyAccess();
  const isOnline = useIsOnline();

  // Initialize app.
  useEffect(() => {
    async function init() {
      // Initialize firebase.
      const app = getOrInitFirebaseApp();
      const auth = getOrInitFirebaseAuth();
      const analytics = getAnalytics(app);
    }

    init();
  }, []);

  return (
    <>
      <SkeletonTheme
        baseColor={"rgba(255, 255, 255, 0.06)"}
        highlightColor={"rgba(255, 255, 255, 0.5)"}
        borderRadius={"0.7rem"}
      >
        <NextUIProvider navigate={router.push}>
          <I18nProvider i18n={i18n}>
            <CustomHistoryProvider>
              <SessionProvider>
                <PersistedScrollPositionProvider>
                  <MountPersistenceProvider>
                    <Modal size={"full"} isOpen={!isOnline}>
                      <ModalContent>
                        {(onClose) => (
                          <div className={"flex flex-col justify-center h-full text-center"}>
                            <div>
                              <Title
                                className={"mx-auto flex flex-row justify-center"}
                                size={"md"}
                              >
                                <Trans>
                                  Lost internet connection, waiting to reconnect...
                                </Trans>
                              </Title>
                              <Spinner />
                            </div>
                          </div>
                        )}
                      </ModalContent>
                    </Modal>
                    <main className={"bg-background text-foreground dark"}>
                      <div className="font-inter">
                        <ToastContainer
                          autoClose={4000}
                          limit={4}
                          newestOnTop={true}
                          theme={"dark"}
                          position={isMobile ? "top-center" : "bottom-center"}
                        />
                        <Component {...pageProps} />
                      </div>
                    </main>
                  </MountPersistenceProvider>
                </PersistedScrollPositionProvider>
              </SessionProvider>
            </CustomHistoryProvider>
          </I18nProvider>
        </NextUIProvider>
      </SkeletonTheme>
    </>
  );
};

export default api.withTRPC(Waifuu);
