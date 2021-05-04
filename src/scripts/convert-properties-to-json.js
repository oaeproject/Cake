#!/usr/bin/env node

/**
 * TODO
 * [x] Create optimist cli interface
 * [x] Make locale an input
 * [ ] Add tests
 */

const humanize = require("@jsdevtools/humanize-anything");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;
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
} = require("ramda");

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
const FOLDER_PATH = Path.join(
  process.cwd(),
  "..",
  "..",
  "Hilary",
  "3akai-ux"
);

const ENGLISH_UK = "en_GB";
const FRENCH = "fr_FR";
const PORTUGUESE = "pt_PT";
const ALLOWED_LOCALES = [ENGLISH_UK, FRENCH, PORTUGUESE];

const NAME = "name";
const ALLOWED_ROOT_FOLDERS = ["packages", "shared"];

const pickOneAvailable = `Pick one of ${humanize.values(ALLOWED_LOCALES)}`;
const isIllegalLocale = doesNotInclude(argv.locale, ALLOWED_LOCALES);
const isLocaleNotDefined = pipe(prop("locale"), isNil)(argv);
const errorOut = (message) => {
  console.error(message);
  process.exit(1);
};

if (isLocaleNotDefined) {
  errorOut(
    `Please specify the locale with --locale=<locale>. ${pickOneAvailable}`
  );
} else if (isIllegalLocale) {
  errorOut(
    `Specified locale (${argv.locale}) is not supported. ${pickOneAvailable}`
  );
}

const isUkEnglish = equals(ENGLISH_UK);
const addPropertiesExtension = concat(__, ".properties");
const returnDefaultPropertiesFile = () => addPropertiesExtension("default");
const returnLocalePropertiesFile = () => addPropertiesExtension(argv.locale);

const LOCALE_PROPERTIES_FILE = ifElse(
  isUkEnglish,
  returnDefaultPropertiesFile,
  returnLocalePropertiesFile
)(argv.locale);
const LOCALE_JSON_FILE = Path.join(
  process.cwd(),
  "src",
  "i18n",
  concat(argv.locale, ".json")
);

const isRightLocale = pipe(prop(NAME), startsWith(LOCALE_PROPERTIES_FILE));

convertFolderTreeToObject(FOLDER_PATH, {}, true)
  .then((rootObject) => {
    const data = new Uint8Array(Buffer.from(JSON.stringify(rootObject)));
    return util.promisify(fs.writeFile)(LOCALE_JSON_FILE, data);
  })
  .then(() => {
    console.log(`The JSON file ${LOCALE_JSON_FILE} has been saved. Bye!`);
  })
  .catch(console.error);

async function extractKeyValuePairsFrom(filePath) {
  return promiseToReadFile(filePath)
    .then(splitLineByLine)
    .then(extractKeyValuePairs)
    .then(mergeAll)
    .catch(console.error);
}

async function convertFolderTreeToObject(folderPath, rootObject, root = false) {
  const folderChildren = await fs.promises.opendir(folderPath);

  for await (const eachFolderChild of folderChildren) {
    const childPath = Path.join(folderPath, eachFolderChild.name);
    const isDirectory = eachFolderChild.isDirectory();
    const isI18nFile = and(
      eachFolderChild.isFile(),
      isRightLocale(eachFolderChild)
    );
    const ifIllegalRootChildren =
      root &&
      isDirectory &&
      doesNotInclude(eachFolderChild.name, ALLOWED_ROOT_FOLDERS);

    /**
     * When downloading from crowdin, we get all the translations except English
     * To migrate English translations, one must traverse 3akai-ux instead of crowdin downloaded folder tree
     * Because of this, we must exclude 3akai-ux root folders, all except `ALLOWED_FOLDERS`
     */
    if (ifIllegalRootChildren) {
      console.log(`Skipping root folder ${eachFolderChild.name}`);
      continue;
    }

    switch (true) {
      case isDirectory:
        rootObject = set(
          lensProp(eachFolderChild.name),
          await convertFolderTreeToObject(childPath, {}),
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
