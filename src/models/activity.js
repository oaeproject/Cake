import { User } from './user';
import { Resource } from './resource';
import { generateSummary } from '../helpers/activity-summary';
import { concat, of, includes, nth, has, head as first, prop, pipe } from 'ramda';

const COLLECTION = 'oae:collection';
const ACTOR = 'actor';
const OBJECT = 'object';
const TARGET = 'target';

const second = nth(1);
const getActor = prop(ACTOR);
const getObject = prop(OBJECT);
const getTarget = prop(TARGET);
const getCollection = prop(COLLECTION);

const getActorCollection = pipe(getActor, getCollection);
const getObjectCollection = pipe(getObject, getCollection);
const getTargetCollection = pipe(getTarget, getCollection);

const hasSeveralActors = pipe(getActor, has(COLLECTION));
const hasSeveralObjects = pipe(getObject, has(COLLECTION));
const hasSeveralTargets = pipe(getTarget, has(COLLECTION));
const hasSingleTarget = has(TARGET);

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

  /** @type {Resource[]} */
  allObjects = [];

  /** @type {Resource[]} */
  allTargets = [];

  /** @type {User[]} */
  allActors = [];

  constructor(rawActivity) {
    this.id = getId(rawActivity);
    this.activityType = getActivityType(rawActivity);
    this.published = new Date(rawActivity?.published);
    this.verb = rawActivity?.verb;

    const addObjects = concat(this.allObjects);
    const addActors = concat(this.allActors);
    const addTargets = concat(this.allTargets);

    // TODO: optimize this
    if (hasSeveralActors(rawActivity)) {
      this.allActors = addActors(
        getActorCollection(rawActivity).map(eachActor => {
          return new User(eachActor);
        }),
      );
    } else {
      this.allActors = addActors(of(new User(rawActivity?.actor)));
    }

    // TODO: optimize this
    if (hasSeveralObjects(rawActivity)) {
      this.allObjects = addObjects(
        getObjectCollection(rawActivity).map(eachObject => {
          return new Resource(eachObject);
        }),
      );
    } else {
      this.allObjects = addObjects(of(new Resource(rawActivity?.object)));
    }

    // TODO: optimize this
    if (hasSeveralTargets(rawActivity)) {
      this.allTargets = addTargets(
        getTargetCollection(rawActivity).map(eachTarget => {
          return new Resource(eachTarget);
        }),
      );
    } else if (hasSingleTarget(rawActivity)) {
      this.allTargets = addTargets(of(new Resource(rawActivity?.target)));
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
  getPrimaryActor() {
    return first(this.allActors);
  }
  getSecondaryActor() {
    return second(this.allActors);
  }
  getPrimaryObject() {
    return first(this.allObjects);
  }
  getSecondaryObject() {
    return second(this.allObjects);
  }
  getPrimaryTarget() {
    return first(this.allTargets);
  }
  getSecondaryTarget() {
    return second(this.allTargets);
  }
}
