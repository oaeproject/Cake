#!/usr/bin/env node

/**
 * How to run:
 * node -r esm src/scripts/convert-properties-to-json.js --locale=<locale>
 */

const humanize = require("@jsdevtools/humanize-anything");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const fs = require("fs");
const Path = require("path");
const util = require("util");
const {
  map,
  equals,
  set,
  lensProp,
  not,
  __,
  isNil,
  includes,
  mergeAll,
  prop,
  and,
  pipe,
  split,
  toString,
  startsWith,
  trim,
  objOf,
  concat,
  ifElse,
  isEmpty,
  forEachObjIndexed,
  is,
  reject,
} = require("ramda");

const isNotEmpty = pipe(isEmpty, not);
const isAnObject = is(Object);
const removeEmptyEntries = reject(isEmpty);
const doesNotInclude = pipe(includes, not);
const promiseToReadFile = util.promisify(fs.readFile);
const splitLineByLine = pipe(toString, split("\n"));
const splitByKeyValue = split("=");
const extractKeyValuePairs = map((eachLine) => {
  const [key, value] = splitByKeyValue(eachLine);
  return objOf(trim(key), value);
});

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
const NAME = "name";
const ALLOWED_ROOT_FOLDERS = ["packages", "shared"];

const isUkEnglish = equals(ENGLISH_UK);
const addPropertiesExtension = concat(__, ".properties");
const returnDefaultPropertiesFile = () => addPropertiesExtension("default");
const returnLocalePropertiesFile = addPropertiesExtension;

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

async function extractKeyValuePairsFrom(filePath) {
  return promiseToReadFile(filePath)
    .then(splitLineByLine)
    .then(extractKeyValuePairs)
    .then(mergeAll)
    .catch(console.error);
}

const cleanEmptyEntries = (object) => {
  let newObject = {};

  forEachObjIndexed((value, key) => {
    const keyLens = lensProp(key);
    const isNestedEntry = and(isAnObject(value), isNotEmpty(value));

    switch (true) {
      case isNestedEntry:
        value = cleanEmptyEntries(value);
      default:
        newObject = set(keyLens, value, newObject);
        break;
    }
  }, object);

  return removeEmptyEntries(newObject);
};

async function convertFolderTreeToObject(
  locale,
  folderPath,
  rootObject,
  root = false
) {
  const folderChildren = await fs.promises.opendir(folderPath);
  const localePropertiesFile = ifElse(
    isUkEnglish,
    returnDefaultPropertiesFile,
    returnLocalePropertiesFile
  )(locale);
  const isRightLocale = pipe(prop(NAME), startsWith(localePropertiesFile));

  for await (const eachFolderChild of folderChildren) {
    const childPath = Path.join(folderPath, eachFolderChild.name);
    const isDirectory = eachFolderChild.isDirectory();
    const isI18nFile = and(
      eachFolderChild.isFile(),
      isRightLocale(eachFolderChild)
    );

    /**
     * When downloading from crowdin, we get all the translations except English
     * To migrate English translations, one must traverse 3akai-ux instead of crowdin
     * downloaded folder tree
     * Because of this, we must exclude 3akai-ux root folders, all except `ALLOWED_FOLDERS`
     */
    const ifIllegalRootChildren =
      root &&
      isDirectory &&
      doesNotInclude(eachFolderChild.name, ALLOWED_ROOT_FOLDERS);
    if (ifIllegalRootChildren) {
      console.log(`Skipping root folder ${eachFolderChild.name}`);
      continue;
    }

    switch (true) {
      case isDirectory:
        rootObject = set(
          lensProp(eachFolderChild.name),
          await convertFolderTreeToObject(locale, childPath, {}),
          rootObject
        );
        break;
      case isI18nFile:
        rootObject = extractKeyValuePairsFrom(childPath);
        break;
      default:
        break;
    }
  }
  return rootObject;
}

run(locale, FOLDER_PATH);
