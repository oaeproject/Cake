import { writable } from 'svelte/store';
import { Map } from 'immutable';
import { prop } from 'ramda';

const MEDIUM = 'medium';
const getMediumPicture = prop(MEDIUM);

/**
 * This store is in fact a Map where for every userId there is
 * an object with all picture sizes like this
 * { small:, medium:, large: }
 */
const usersInfo = writable(new Map());

/**
 * @function fetchUserAvatar
 * @param  {User} actor The actor/user we're fetching the profile from the backend
 * @param  {Map} users  The Map holding the cache for users' profile pictures
 * @return {Object}     An object with all picture sizes (`small`, `medium` and `large`)
 */
const fetchUserAvatar = async (actor, users) => {
  const userIsCached = users.has(actor.id);
  let pictureSet = null;

  if (userIsCached) {
    pictureSet = users.get(actor.id);
  } else {
    let data = await fetch(actor.apiUrl);
    data = await data.json();
    pictureSet = data.picture;

    users.set(actor.id, pictureSet);
    usersInfo.set(users);
  }

  return pictureSet;
};

const getAvatar = async (actor, users) => {
  switch (true) {
    case actor.hasNoPicture:
      return fetchUserAvatar(actor, users).then(getMediumPicture);
    case actor.hasAnyPicture:
      return actor.mediumPicture;
  }
};

export { usersInfo, getAvatar };
