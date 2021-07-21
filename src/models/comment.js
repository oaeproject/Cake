import { Tenant } from './tenant';
import { User } from './user';

export class Comment {
  /** @type {number} */
  level;
  /** @type {User} */
  author;
  /** @type {string} */
  content;
  /** @type {number} */
  id;
  /** @type {string} */
  apiUrl;
  /** @type {number} */
  messageBoxId;
  /** @type {number} */
  threadKey;
  /** @type {string} */
  objectType;
  /** @type {Date} */
  published;
  /** @type {Comment[]} */
  replies;
  /** @type {string} */
  url;

  constructor(rawComment, level) {
    this.level = level;
    this.author = new User(rawComment.author);
    this.content = rawComment.content;
    this.apiUrl = rawComment.id;
    this.id = rawComment['oae:id'];
    this.messageBoxId = rawComment['oae:messageBoxId'];
    this.tenant = new Tenant(rawComment['oae:tenant']);
    this.threadKey = rawComment['oae:threadKey'];
    this.objectType = rawComment.objectType;
    this.published = new Date(rawComment.published);
    // TODO probably use map and create other comments
    this.replies = rawComment.replies;
    this.url = rawComment.url;
  }
}
