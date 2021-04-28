import { User } from "./user";
import { prop, includes } from "ramda";

import anylogger from "anylogger";
const log = anylogger("activity-model");

const getActivityType = prop("oae:activityType");

// Variable that keeps track of the different activity types that are used for comment activities
export const COMMENT_ACTIVITY_TYPES = [
  "content-comment",
  "folder-comment",
  "discussion-message",
  "meeting-jitsi-message",
];

// Variable that keeps track of the different activity types that are used for sharing activities
// const SHARE_ACTIVITY_TYPES = ['content-share', 'discussion-share', 'folder-share', 'meeting-jitsi-share'];

const getId = prop("oae:activityId");
const getType = prop("oae:activityType");

export class ActivityItem {
  activityItems: ActivityItem[]; // in case this is a collection / aggregate of activity items, I think
  id: number;
  activityType: string;
  originalActivity: ActivityItem;
  published: Date;
  primaryActor: User;
  object;
  verb: string;
  summary: string;
  allComments: Comment[];
  latestComments: Comment[];

  constructor(rawActivity) {
    this.id = getId(rawActivity);
    this.activityType = getType(rawActivity);
    this.published = new Date(rawActivity.published);
    this.summary = this.generateSummary(
      rawActivity.actor,
      rawActivity.verb,
      rawActivity.object
    );
    this.primaryActor = new User(rawActivity.actor);
    this.object = rawActivity.object;
    this.verb = rawActivity.verb;

    if (includes(getActivityType(rawActivity), COMMENT_ACTIVITY_TYPES)) {
      this.allComments = rawActivity.object["oae:collection"];
      this.latestComments = rawActivity.object.latestComments;
    }
  }

  generateSummary(actor, verb, object) {
    return `${actor} just ${verb} on ${object}`;
  }
}
