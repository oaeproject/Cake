import { writable } from 'svelte/store';
import { Map } from 'immutable';
import { prop } from 'ramda';

const usersInfo = writable(new Map());

const fetchUserAvatar = async (actor, users) => {
  if (users.has(actor.id)) {
    return users.get(actor.id);
  } else {
    /**
     * Lets fetch the avatar and cache it on the Map
     */
    let data = await fetch(actor.apiUrl);
    data = await data.json();

    users.set(actor.id, {
      small: data.picture.small,
      medium: data.picture.medium,
      large: data.picture.large,
    });

    usersInfo.set(users);

    return data.picture;
  }
};

const getAvatar = async (primaryActor, users) => {
  switch (true) {
    case primaryActor.hasNoPicture:
      return fetchUserAvatar(primaryActor, users).then(prop('medium'));
    case primaryActor.hasAnyPicture:
      return primaryActor.mediumPicture;
  }
};

export { usersInfo, getAvatar };
