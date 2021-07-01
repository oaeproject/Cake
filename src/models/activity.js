import { User } from './user';
import { Resource } from './resource';
import { generateSummary } from '../helpers/activity-summary';
import { includes, nth, has, head, prop, pipe } from 'ramda';

const COLLECTION = 'oae:collection';
const ACTOR = 'actor';
const OBJECT = 'object';

const second = nth(1);
const getActor = prop(ACTOR);
const getObject = prop(OBJECT);
const getCollection = prop(COLLECTION);

const getActorCollection = pipe(getActor, getCollection);
const getObjectCollection = pipe(getObject, getCollection);

const hasSeveralActors = pipe(getActor, has(COLLECTION));
const hasSeveralObjects = pipe(getObject, has(COLLECTION));

const getFirstActor = pipe(getActorCollection, head);
const getFirstObject = pipe(getObjectCollection, head);

const getSecondActor = pipe(getActorCollection, second);
const getSecondObject = pipe(getObjectCollection, second);

// Variable that keeps track of the different activity types that are used for comment activities
export const COMMENT_ACTIVITY_TYPES = [
  'content-comment',
  'folder-comment',
  'discussion-message',
  'meeting-jitsi-message',
];

// Variable that keeps track of the different activity types that are used for sharing activities
const SHARE_ACTIVITY_TYPES = ['content-share', 'discussion-share', 'folder-share', 'meeting-jitsi-share'];

const getActivityType = prop('oae:activityType');
const getId = prop('oae:activityId');

export class ActivityItem {
  /**
   * @type {ActivityItem[]}
   * in case this is a collection / aggregate of activity items, I think
   */
  activityItems;

  /** @type {number} */
  id;

  /** @type {string} */
  activityType;

  /** @type {ActivityItem} */
  originalActivity;

  /** @type {Date} */
  published;

  /** @type {User} */
  primaryActor;

  /** @type {Resource} */
  object;

  /** @type {string} */
  verb;

  /** @type {string} */
  summary;

  /** @type {Comment[]} */
  allComments;

  /** @type {Comment[]} */
  latestComments;

  constructor(rawActivity) {
    this.id = getId(rawActivity);
    this.activityType = getActivityType(rawActivity);
    this.published = new Date(rawActivity?.published);
    this.verb = rawActivity?.verb;

    if (hasSeveralActors(rawActivity)) {
      this.primaryActor = new User(getFirstActor(rawActivity));
      this.secondaryActor = new User(getSecondActor(rawActivity));
    } else {
      this.primaryActor = new User(rawActivity?.actor);
    }

    if (hasSeveralObjects(rawActivity)) {
      this.primaryObject = new Resource(getFirstObject(rawActivity));
      this.secondaryObject = new Resource(getSecondObject(rawActivity));
    } else {
      this.primaryObject = new Resource(rawActivity?.object);
    }

    const isOneOfCommentActivities = includes(getActivityType(rawActivity), COMMENT_ACTIVITY_TYPES);
    if (isOneOfCommentActivities) {
      this.allComments = rawActivity.object['oae:collection'];
      this.latestComments = rawActivity.object.latestComments;
    }
  }

  getSummary(currentUser) {
    return generateSummary(currentUser, this);
  }
}
