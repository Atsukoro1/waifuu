import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";

import { i18n } from "@lingui/core";
import { FlagComponent, US } from "country-flag-icons/react/3x2";

/**
 * This file contains everything related to internationalization.
 */

export type LocaleCode = "en" /* | "cs"*/;
const defaultLoc: LocaleCode = "en";

type Locales = {
  code: LocaleCode;
  label: string;
  flag: FlagComponent;
}[];

export const locales: Locales = [
  { code: "en", label: "English", flag: US },
  /*{ code: "cs", label: "Čeština", flag: CZ },*/
];

export function getCurrentLocale() {
  return i18n.locale as LocaleCode;
}

/*export async function changeAndSaveGlobalLocale(locale: LocaleCode) {
  if (!isLocaleSupported(locale)) {
    throw new Error(`Locale ${locale} is not supported.`);
  }

  await setI18nLocale(locale);
  if (locale === defaultLoc) {
    await Preferences.remove({ key: "locale" });
  } else {
    await Preferences.set({ key: "locale", value: locale });
  }
}*/

export async function initGlobalLocale() {
  const locale = "en"; /*await getMostSuitableLocale();*/
  await setI18nLocale(locale);
}

async function setI18nLocale(locale: LocaleCode) {
  const { messages } = await import(`../locales/${locale}/messages`);
  i18n.loadAndActivate({ locale, messages });
  // Set html lang attribute.
  /*if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
  }*/
}

export async function getMostSuitableLocale(): Promise<LocaleCode> {
  /*const { value: localeFromStorage } = await Preferences.get({
    key: "locale",
  });
  if (localeFromStorage && isLocaleSupported(localeFromStorage))
    return localeFromStorage as LocaleCode;*/

  if (Capacitor.isNativePlatform()) {
    const { value } = await Device.getLanguageCode();
    if (isLocaleSupported(value)) return value as LocaleCode;
  } else {
    for (let i = 0; i < navigator.languages.length; i++) {
      // biome-ignore lint/style/noNonNullAssertion: Will not be null.
      const lang = navigator.languages[i]!;
      if (isLocaleSupported(lang)) return lang as LocaleCode;
    }
  }

  return defaultLoc;
}

function isLocaleSupported(locale: string) {
  return locales.some((l) => l.code === locale);
}
