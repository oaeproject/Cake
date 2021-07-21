import fs from 'fs';
import Path from 'path';
import util from 'util';
import {
  map,
  replace,
  equals,
  set,
  lensProp,
  not,
  __,
  isNil,
  either,
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
} from 'ramda';

const isNotEmpty = pipe(isEmpty, not);
const isAnObject = is(Object);
const removeEmptyEntries = reject(either(isEmpty, isNil));
const doesNotInclude = pipe(includes, not);
const promiseToReadFile = util.promisify(fs.readFile);
const splitLineByLine = pipe(toString, split('\n'));
const splitByKeyValue = split('=');
const extractKeyValuePairs = map(eachLine => {
  let [key, value] = splitByKeyValue(eachLine);
  if (value) value = replace(/\${/g, '{', value);
  // if (value) value = value.replaceAll('${', '{');
  return objOf(trim(key), value);
});

const ENGLISH_UK = 'en_GB';
const NAME = 'name';
const ALLOWED_ROOT_FOLDERS = ['packages', 'shared'];

const isUkEnglish = equals(ENGLISH_UK);
const addPropertiesExtension = concat(__, '.properties');
const returnDefaultPropertiesFile = () => addPropertiesExtension('default');
const returnLocalePropertiesFile = addPropertiesExtension;

async function extractKeyValuePairsFrom(filePath) {
  return promiseToReadFile(filePath)
    .then(splitLineByLine)
    .then(extractKeyValuePairs)
    .then(mergeAll)
    .catch(console.error);
}

const cleanEmptyEntries = object => {
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

async function convertFolderTreeToObject(locale, folderPath, rootObject, root = false) {
  const folderChildren = await fs.promises.opendir(folderPath);
  const localePropertiesFile = ifElse(isUkEnglish, returnDefaultPropertiesFile, returnLocalePropertiesFile)(locale);
  const isRightLocale = pipe(prop(NAME), startsWith(localePropertiesFile));

  for await (const eachFolderChild of folderChildren) {
    const childPath = Path.join(folderPath, eachFolderChild.name);
    const isDirectory = eachFolderChild.isDirectory();
    const isI18nFile = and(eachFolderChild.isFile(), isRightLocale(eachFolderChild));

    /**
     * When downloading from crowdin, we get all the translations except English
     * To migrate English translations, one must traverse 3akai-ux instead of crowdin
     * downloaded folder tree
     * Because of this, we must exclude 3akai-ux root folders, all except `ALLOWED_FOLDERS`
     */
    const ifIllegalRootChildren = root && isDirectory && doesNotInclude(eachFolderChild.name, ALLOWED_ROOT_FOLDERS);
    if (ifIllegalRootChildren) {
      // console.log(`Skipping root folder ${eachFolderChild.name}`);
      continue;
    }

    switch (true) {
      case isDirectory:
        rootObject = set(
          lensProp(eachFolderChild.name),
          await convertFolderTreeToObject(locale, childPath, {}),
          rootObject,
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

export { convertFolderTreeToObject, cleanEmptyEntries };
