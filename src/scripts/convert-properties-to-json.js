#!/usr/bin/env node

/**
 * How to run:
 * node -r esm src/scripts/convert-properties-to-json.js --locale=<locale>
 */

import {
  convertFolderTreeToObject,
  cleanEmptyEntries,
} from "./conversion-utils";

import humanize from "@jsdevtools/humanize-anything";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import fs from "fs";
import Path from "path";
import util from "util";
import { not, __, isNil, includes, pipe, concat } from "ramda";

const doesNotInclude = pipe(includes, not);

/**
 * Set this folder path to a 3akai-ux directory, because
 * that' where the current translations are.
 *
 * Eventually we'll be able to point it to a crowdin downloaded
 * folder when it includes en_GB translations as well
 */
const FOLDER_PATH = Path.join(process.cwd(), "..", "..", "Hilary", "3akai-ux");

const ENGLISH_UK = "en_GB";
const FRENCH = "fr_FR";
const PORTUGUESE = "pt_PT";
const ALLOWED_LOCALES = [ENGLISH_UK, FRENCH, PORTUGUESE];

const pickOneAvailable = `Pick one of ${humanize.values(ALLOWED_LOCALES)}`;
const isIllegalLocale = () => doesNotInclude(__, ALLOWED_LOCALES);
const isLocaleNotDefined = isNil;
const errorOut = (message) => {
  console.error(message);
  process.exit(1);
};

/**
 * CLI input parsing
 */
const argv = yargs(hideBin(process.argv)).argv;
const { locale } = argv;

if (isLocaleNotDefined(locale)) {
  errorOut(
    `Please specify the locale with --locale=<locale>. ${pickOneAvailable}`
  );
} else if (isIllegalLocale(locale)) {
  errorOut(
    `Specified locale (${locale}) is not supported. ${pickOneAvailable}`
  );
}

const run = (locale, folderPath) => {
  const LOCALE_JSON_FILE = Path.join(
    process.cwd(),
    "src",
    "i18n",
    concat(locale, ".json")
  );

  const getWritableBufferFromObject = (object) =>
    new Uint8Array(Buffer.from(JSON.stringify(object)));
  const writeJsonFile = (data) =>
    util.promisify(fs.writeFile)(LOCALE_JSON_FILE, data);

  convertFolderTreeToObject(locale, folderPath, {}, true)
    .then(cleanEmptyEntries)
    .then(getWritableBufferFromObject)
    .then(writeJsonFile)
    .then(() => {
      console.log(`The JSON file ${LOCALE_JSON_FILE} has been saved. Bye!`);
    })
    .catch(console.error);
};

run(locale, FOLDER_PATH);
