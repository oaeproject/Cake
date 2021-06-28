import { and, not, has, equals, head, nth, prop, pipe, length, gt } from 'ramda';
import { ActivityItem } from '../models/activity';

const isOne = equals(1);
const isTwo = equals(2);
const second = nth(1);
const moreThanOne = gt(1);

const ACTOR = 'actor';
const OBJECT = 'object';
const TARGET = 'target';

const ID = 'id';
const SUB_TYPE = 'subType';
const VISIBILITY = 'visibility';
const PRIMARY_OBJECT = 'primaryObject';
const PUBLIC = 'public';
const LOGGEDIN = 'loggedin';

const USER = 'user';
const GROUP = 'group';
const FOLDER = 'folder';
const FILE = 'file';
const LINK = 'link';
const COLLABDOC = 'collabdoc';
const COLLABSHEET = 'collabsheet';
const COLLECTION = 'oae:collection';
const ACTIVITY_TYPE = 'activityType';

// dont know why the keys __are__like__this__ but oh well
const transformKey = i18nKey => {
  i18nKey = i18nKey.split('__')[2];
  i18nKey = 'shared.oae.bundles.ui.' + i18nKey;
  return i18nKey;
};

/**
 * Given a current set of properties, property key and an entity, attach the values for the
 * entity that can be used to render them in the activity template
 *
 * @param  {Object}     properties                              The arbitrary activity summary properties
 * @param  {String}     propertyKey                             The base key for the property (e.g., actor1, actor2, object1, etc...)
 * @param  {Object}     entity                                  The entity for which to create the summary properties
 * @param  {Function}   sanitization.encodeForHTML              Encode a value such that it is safe to be embedded into an HTML tag
 * @param  {Function}   sanitization.encodeForHTMLAttribute     Encode a value such that it is safe to be embedded into an HTML attribute
 * @param  {Function}   sanitization.encodeForURL               Encode a value such that it is safe to be used as a URL fragment
 * @param  {Object}     [opts]                                  Optional arguments
 * @param  {String}     [opts.resourceHrefOverride]             When specified, this value will replace any URL specified for an entity. This can be used to control outbound links in different contexts (e.g., email invitation)
 * @api private
 */
const setSummaryPropertiesForEntity = function (properties, propertyKey, entity) {
  const displayNameKey = propertyKey;
  const profilePathKey = propertyKey + 'URL';
  const displayLinkKey = propertyKey + 'Link';
  const tenantDisplayNameKey = propertyKey + 'Tenant';

  // This holds the "display name" of the entity
  properties[displayNameKey] = entity.displayName;
  // properties[profilePathKey] = opts.resourceHrefOverride || entity['oae:profilePath'];
  properties[profilePathKey] = entity.profilePath;

  /**
   * If the profile path was set, it indicates that we have access to view the user,
   * therefore we should display a link. If not specified, we should show plain-text
   */
  if (properties[profilePathKey]) {
    properties[displayLinkKey] = '<a href="' + properties[profilePathKey] + '">' + properties[displayNameKey] + '</a>';
  } else {
    properties[displayLinkKey] = '<span>' + properties[displayNameKey] + '</span>';
  }

  if (entity.tenant) {
    properties[tenantDisplayNameKey] = entity.tenant.displayName;
  }
};

/**
 * Given an activity, generate an approriate summary
 *
 * @param  {User}                   me                                      The currently loggedin user
 * @param  {Activity}               activityItem                                The activity for which to generate a summary
 * @param  {Object}                 sanitization                            An object that exposes basic HTML encoding functionality
 * @param  {Function}               sanitization.encodeForHTML              Encode a value such that it is safe to be embedded into an HTML tag
 * @param  {Function}               sanitization.encodeForHTMLAttribute     Encode a value such that it is safe to be embedded into an HTML attribute
 * @param  {Function}               sanitization.encodeForURL               Encode a value such that it is safe to be used as a URL fragment
 * @param  {Object}                 [opts]                                  Optional arguments
 * @param  {String}                 [opts.resourceHrefOverride]             When specified, this value will replace any URL specified for an entity. This can be used to control outbound links in different contexts (e.g., email invitation)
 * @return {ActivityItem}                                            The summary for the given activity
 * @api private
 */
const generateSummary = function (me, activityItem) {
  // The dictionary that can be used to translate the dynamic values in the i18n keys
  const properties /*: { actorCount: number; objectCount: number } */ = {
    actorCount: null,
    objectCount: null,
  };

  const activityIs = pipe(prop(ACTIVITY_TYPE), equals)(activityItem);

  const hasTarget = has(TARGET);

  const getCollection = prop(COLLECTION);
  const getActor = prop(ACTOR);
  const getObject = prop(OBJECT);
  const getTarget = prop(TARGET);

  const hasSeveralActors = pipe(getActor, has(COLLECTION));
  const hasSeveralObjects = pipe(getObject, has(COLLECTION));
  const hasSeveralTargets = pipe(getTarget, has(COLLECTION));

  const getActorCollection = pipe(getActor, getCollection);
  const getObjectCollection = pipe(getObject, getCollection);
  const getTargetCollection = pipe(getTarget, getCollection);

  const numberOfActors = pipe(getActorCollection, length);
  const numberOfObjects = pipe(getObjectCollection, length);
  const numberOfTargets = pipe(getTargetCollection, length);

  const moreThanOneActor = pipe(numberOfActors, moreThanOne);
  const moreThanOneObject = pipe(numberOfObjects, moreThanOne);
  const moreThanOneTarget = pipe(numberOfTargets, moreThanOne);

  const getFirstActor = pipe(getActorCollection, head);
  const getFirstObject = pipe(getObjectCollection, head);
  const getFirstTarget = pipe(getTargetCollection, head);

  const getSecondActor = pipe(getActorCollection, second);
  const getSecondObject = pipe(getObjectCollection, second);
  const getSecondTarget = pipe(getTargetCollection, second);

  // Prepare the actor-related variables that will be present in the i18n keys
  let actor1 = null;
  properties.actorCount = 1;

  if (hasSeveralActors(activityItem)) {
    actor1 = getFirstActor(activityItem);
    if (moreThanOneActor(activityItem)) {
      // Apply the actor count information to the summary properties
      properties.actorCount = numberOfActors(activityItem);
      properties.actorCountMinusOne = properties.actorCount - 1; // TODO: remove this

      // Apply additional actor information
      setSummaryPropertiesForEntity(properties, 'actor2', getSecondActor(activityItem));
    }
  } else {
    actor1 = activityItem.primaryActor;
  }

  // Apply the actor1 information to the summary properties
  setSummaryPropertiesForEntity(properties, 'actor1', actor1);

  // Prepare the object-related variables that will be present in the i18n keys
  let object1 = null;
  properties.objectCount = 1;

  if (hasSeveralObjects(activityItem)) {
    object1 = getFirstObject(activityItem);
    if (moreThanOneObject(activityItem)) {
      // Apply the object count information to the summary properties
      properties.objectCount = numberOfObjects(activityItem);
      properties.objectCountMinusOne = properties.objectCount - 1; // TODO: remove this

      // Apply additional object information
      setSummaryPropertiesForEntity(properties, 'object2', getSecondObject(activityItem));
    }
  } else {
    object1 = activityItem.primaryObject;
  }

  // Apply the object1 information to the summary properties
  setSummaryPropertiesForEntity(properties, 'object1', object1);

  // Prepare the target-related variables that will be present in the i18n keys
  let target1Obj = null;
  if (hasTarget(activityItem)) {
    properties.targetCount = 1;
    if (hasSeveralTargets(activityItem)) {
      target1Obj = getFirstTarget(activityItem);
      if (moreThanOneTarget(activityItem)) {
        // Apply the target count information to the summary properties
        properties.targetCount = numberOfTargets(activityItem);
        properties.targetCountMinusOne = properties.targetCount - 1; // TODO: remove this

        // Apply additional target information
        setSummaryPropertiesForEntity(properties, 'target2', getSecondTarget);
      }
    } else {
      target1Obj = activityItem.target;
    }

    // Apply the target1 information to the summary properties
    setSummaryPropertiesForEntity(properties, 'target1', target1Obj);
  }

  // Depending on the activity type, we render a different template that is specific to that activity,
  // to make sure that the summary is as accurate and descriptive as possible

  if (activityIs('content-add-to-library')) {
    return generateContentAddToLibrarySummary(me, activityItem, properties);
  }

  if (activityIs('content-comment')) {
    return generateContentCommentSummary(me, activityItem, properties);
  }

  if (activityIs('content-create')) {
    return generateContentCreateSummary(me, activityItem, properties);
  }

  if (activityIs('content-restored-revision')) {
    return generateContentRestoredRevision(activityItem, properties);
  }

  if (activityIs('content-revision')) {
    return generateContentRevisionSummary(me, activityItem, properties);
  }

  if (activityIs('content-share')) {
    return generateContentShareSummary(me, activityItem, properties);
  }

  if (activityIs('content-update')) {
    return generateContentUpdateSummary(me, activityItem, properties);
  }

  if (activityIs('content-update-member-role')) {
    return generateContentUpdateMemberRoleSummary(me, activityItem, properties);
  }

  if (activityIs('content-update-visibility')) {
    return generateContentUpdateVisibilitySummary(me, activityItem, properties);
  }

  if (activityIs('discussion-add-to-library')) {
    return generateDiscussionAddToLibrarySummary(me, activityItem, properties);
  }

  if (activityIs('discussion-create')) {
    return generateDiscussionCreateSummary(me, activityItem, properties);
  }

  if (activityIs('discussion-message')) {
    return generateDiscussionMessageSummary(me, activityItem, properties);
  } else if (activityIs('discussion-share')) {
    return generateDiscussionShareSummary(me, activityItem, properties);
  } else if (activityIs('discussion-update')) {
    return generateDiscussionUpdateSummary(me, activityItem, properties);
  } else if (activityIs('discussion-update-member-role')) {
    return generateDiscussionUpdateMemberRoleSummary(me, activityItem, properties);
  } else if (activityIs('discussion-update-visibility')) {
    return generateDiscussionUpdateVisibilitySummary(me, activityItem, properties);
  } else if (activityIs('folder-add-to-folder')) {
    return generateFolderAddToFolderSummary(me, activityItem, properties);
  } else if (activityIs('folder-add-to-library')) {
    return generateFolderAddToLibrarySummary(me, activityItem, properties);
  } else if (activityIs('folder-comment')) {
    return generateFolderCommentSummary(me, activityItem, properties);
  } else if (activityIs('folder-create')) {
    return generateFolderCreateSummary(me, activityItem, properties);
  } else if (activityIs('folder-share')) {
    return generateFolderShareSummary(me, activityItem, properties);
  } else if (activityIs('folder-update')) {
    return generateFolderUpdateSummary(me, activityItem, properties);
  } else if (activityIs('folder-update-member-role')) {
    return generateFolderUpdateMemberRoleSummary(me, activityItem, properties);
  } else if (activityIs('folder-update-visibility')) {
    return generateFolderUpdateVisibilitySummary(me, activityItem, properties);
  } else if (activityIs('following-follow')) {
    return generateFollowingSummary(me, activityItem, properties);
  } else if (activityIs('group-add-member')) {
    return generateGroupAddMemberSummary(me, activityItem, properties);
  } else if (activityIs('group-create')) {
    return generateGroupCreateSummary(me, activityItem, properties);
  } else if (activityIs('group-join')) {
    return generateGroupJoinSummary(me, activityItem, properties);
  } else if (activityIs('group-update')) {
    return generateGroupUpdateSummary(me, activityItem, properties);
  } else if (activityIs('group-update-member-role')) {
    return generateGroupUpdateMemberRoleSummary(me, activityItem, properties);
  } else if (activityIs('group-update-visibility')) {
    return generateGroupUpdateVisibilitySummary(me, activityItem, properties);
  } else if (activityIs('invite') || activityIs('invitation-accept')) {
    return generateInvitationSummary(me, activityItem, properties);
  } else if (activityIs('meeting-jitsi-create')) {
    return generateMeetingJitsiCreateSummary(me, activityItem, properties);
  } else if (activityIs('meeting-jitsi-message')) {
    return generateMeetingJitsiMessageSummary(me, activityItem, properties);
  } else if (activityIs('meeting-jitsi-share')) {
    return generateMeetingJitsiShareSummary(me, activityItem, properties);
  } else if (activityIs('meeting-jitsi-update')) {
    return generateMeetingJitsiUpdateSummary(me, activityItem, properties);
  } else if (activityIs('meeting-jitsi-update-member-role')) {
    return generateMeetingJitsiUpdateMemberRoleSummary(me, activityItem, properties);
  } else if (activityIs('meeting-jitsi-update-visibility')) {
    return generateMeetingJitsiUpdateVisibilitySummary(me, activityItem, properties);
  } else if (activityIs('request-to-join-group')) {
    return generateRequestToJoinGroupSummary(me, activityItem, properties);
    // Fall back on the default activity summary if no specific template is found for the activity type
  } else if (activityIs('request-to-join-group-rejected')) {
    return generateRejectedRequestToJoinGroup(me, activityItem, properties);
  } else {
    return generateDefaultSummary(me, activityItem, properties);
  }
};

/**
 * Render the end-user friendly, internationalized summary of an add to content library activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the add to content library activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {Object}                    A summary object
 * @api private
 */
const generateContentAddToLibrarySummary = function (me, activity, properties) {
  let i18nKey = null;

  const activityObjectIs = pipe(prop(PRIMARY_OBJECT), prop(SUB_TYPE), equals)(activity);
  const justTheOneObject = isOne(properties.objectCount);
  const severalObjects = isTwo(properties.objectCount);

  switch (true) {
    case justTheOneObject:
      switch (true) {
        case activityObjectIs(COLLABDOC):
          i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_COLLABDOC__';
          break;
        case activityObjectIs(COLLABSHEET):
          i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_COLLABSHEET__';
          break;
        case activityObjectIs(FILE):
          i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_FILE__';
          break;
        case activityObjectIs(LINK):
          i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_LINK__';
          break;
      }
      break;
    case severalObjects:
      i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_2__';
      break;
    default:
      i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_2+__';
      break;
  }

  /*
  if (justTheOneObject) {
    if (activityObjectIs(COLLABDOC)) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_COLLABDOC__';
    } else if (activityObjectIs(COLLABSHEET)) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_COLLABSHEET__';
    } else if (activityObjectIs(FILE)) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_FILE__';
    } else if (activityObjectIs(LINK)) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_LINK__';
    }
  } else if (severalObjects) {
    i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_2+__';
  }
  */

  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a content comment activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the content comment activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {Object}                    A summary object
 * @api private
 */
const generateContentCommentSummary = function (me, activity, properties) {
  let i18nKey = null;

  const activityTargetIs = pipe(prop(TARGET), prop(SUB_TYPE), equals)(activity);
  const justTheOneActor = isOne(properties.actorCount);
  const severalActors = isTwo(properties.actorCount);

  switch (true) {
    case activityTargetIs(COLLABDOC):
      switch (true) {
        case justTheOneActor:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_COLLABDOC_1__';
          break;
        case severalActors:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_COLLABDOC_2__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_COLLABDOC_2+__';
          break;
      }
      break;
    case activityTargetIs(COLLABSHEET):
      switch (true) {
        case justTheOneActor:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_COLLABSHEET_1__';
          break;
        case severalActors:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_COLLABSHEET_2__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_COLLABSHEET_2+__';
          break;
      }
      break;
    case activityTargetIs(FILE):
      switch (true) {
        case justTheOneActor:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_FILE_1__';
          break;
        case severalActors:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_FILE_2__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_FILE_2+__';
          break;
      }
      break;
    case activityTargetIs(LINK):
      switch (true) {
        case justTheOneActor:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_LINK_1__';
          break;
        case severalActors:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_LINK_2__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_LINK_2+__';
          break;
      }
      break;
  }

  /*
  if (activityTargetIs(COLLABDOC)) {
    if (justTheOneActor) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_COLLABDOC_1__';
    } else if (severalActors) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_COLLABDOC_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_COLLABDOC_2+__';
    }
  } else if (activityTargetIs(COLLABSHEET)) {
    if (justTheOneActor) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_COLLABSHEET_1__';
    } else if (severalActors) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_COLLABSHEET_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_COLLABSHEET_2+__';
    }
  } else if (activityTargetIs(FILE)) {
    if (justTheOneActor) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_FILE_1__';
    } else if (severalActors) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_FILE_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_FILE_2+__';
    }
  } else if (activityTargetIs(LINK)) {
    if (justTheOneActor) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_LINK_1__';
    } else if (severalActors) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_LINK_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_LINK_2+__';
    }
  }
  */

  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a content creation activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the content creation activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {Object}                    A summary object
 * @api private
 */
const generateContentCreateSummary = function (me, activity, properties) {
  let i18nKey = null;

  const justTheOneObject = isOne(properties.objectCount);
  const justTheTwoObjects = isTwo(properties.objectCount);

  const justTheOneTarget = isOne(properties.targetCount);

  const targetTypeIs = pipe(prop('target'), prop('objectType'), equals)(activity);
  const objectTypeIs = pipe(prop('primaryObject'), prop('subType'), equals)(activity);

  const targetIsCurrentUser = pipe(prop(TARGET), prop(ID), equals(me.id))(activity);
  const targetIsNotTheCurrentUser = not(targetIsCurrentUser);

  /**
   * Add the target to the activity summary when a target is present on the
   * activity and the target is not a user different from the current user
   */
  if (justTheOneTarget && not(and(targetTypeIs(USER), targetIsNotTheCurrentUser))) {
    if (targetIsCurrentUser) {
      if (justTheOneObject) {
        if (objectTypeIs(COLLABDOC)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_COLLABDOC_YOU__';
        } else if (objectTypeIs(COLLABSHEET)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_COLLABSHEET_YOU__';
        } else if (objectTypeIs(FILE)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_FILE_YOU__';
        } else if (objectTypeIs(LINK)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_LINK_YOU__';
        }
      } else if (justTheTwoObjects) {
        i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2_YOU__';
      } else {
        i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2+_YOU__';
      }
    } else if (targetTypeIs(FOLDER)) {
      if (justTheOneObject) {
        if (objectTypeIs(COLLABDOC)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_COLLABDOC_FOLDER__';
        } else if (objectTypeIs(COLLABSHEET)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_COLLABSHEET_FOLDER__';
        } else if (objectTypeIs(FILE)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_FILE_FOLDER__';
        } else if (objectTypeIs(LINK)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_LINK_FOLDER__';
        }
      } else if (justTheTwoObjects) {
        i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2_FOLDER__';
      } else {
        i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2+_FOLDER__';
      }
    } else if (targetTypeIs(GROUP)) {
      if (justTheOneObject) {
        if (objectTypeIs(COLLABDOC)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_COLLABDOC_GROUP__';
        } else if (objectTypeIs(COLLABSHEET)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_COLLABSHEET_GROUP__';
        } else if (objectTypeIs(FILE)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_FILE_GROUP__';
        } else if (objectTypeIs(LINK)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_LINK_GROUP__';
        }
      } else if (justTheTwoObjects) {
        i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2_GROUP__';
      } else {
        i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2+_GROUP__';
      }
    }
  } else if (justTheOneObject) {
    if (objectTypeIs(COLLABDOC)) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_COLLABDOC__';
    } else if (objectTypeIs(COLLABSHEET)) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_COLLABSHEET__';
    } else if (objectTypeIs(FILE)) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_FILE__';
    } else if (objectTypeIs(LINK)) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_LINK__';
    }
  } else if (justTheTwoObjects) {
    i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a restored content revision activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the restore content revision activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateContentRestoredRevision = function (activity, properties) {
  let i18nKey = null;

  const objectTypeIs = pipe(prop(PRIMARY_OBJECT), prop(SUB_TYPE))(activity);

  const justTheOneActor = isOne(properties.actorCount);
  const justTheTwoActors = isTwo(properties.actorCount);

  switch (true) {
    case objectTypeIs(COLLABDOC):
      switch (true) {
        case justTheOneActor:
          i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_COLLABDOC_1__';
          break;
        case justTheTwoActors:
          i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_COLLABDOC_2__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_COLLABDOC_2+__';
          break;
      }
      break;
    case objectTypeIs(COLLABSHEET):
      switch (true) {
        case justTheOneActor:
          i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_COLLABSHEET_1__';
          break;
        case justTheTwoActors:
          i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_COLLABSHEET_2__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_COLLABSHEET_2+__';
          break;
      }
      break;
    case objectTypeIs(FILE):
      switch (true) {
        case justTheOneActor:
          i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_FILE_1__';
          break;
        case justTheTwoActors:
          i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_FILE_2__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_FILE_2+__';
          break;
      }
      break;
  }

  /*
  if (objectTypeIs(COLLABDOC)) {
    if (justTheOneActor) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_COLLABDOC_1__';
    } else if (justTheTwoActors) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_COLLABDOC_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_COLLABDOC_2+__';
    }
  } else if (objectTypeIs(COLLABSHEET)) {
    if (justTheOneActor) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_COLLABSHEET_1__';
    } else if (justTheTwoActors) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_COLLABSHEET_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_COLLABSHEET_2+__';
    }
  } else if (objectTypeIs(FILE)) {
    if (justTheOneActor) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_FILE_1__';
    } else if (justTheTwoActors) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_FILE_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_FILE_2+__';
    }
  }
  */

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a new content version activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the content revision creation activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateContentRevisionSummary = function (me, activity, properties) {
  let i18nKey = null;

  // TODO this is redundant, make it not so
  const justTheOneActor = isOne(properties.actorCount);
  const justTheTwoActors = isTwo(properties.actorCount);
  // TODO this is redundant, make it not so
  const objectTypeIs = pipe(prop(PRIMARY_OBJECT), prop(SUB_TYPE))(activity);

  switch (true) {
    case objectTypeIs(COLLABDOC):
      switch (true) {
        case justTheOneActor:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_COLLABDOC_1__';
          break;
        case justTheTwoActors:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_COLLABDOC_2__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_COLLABDOC_2+__';
          break;
      }
      break;
    case objectTypeIs(COLLABSHEET):
      switch (true) {
        case justTheOneActor:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_COLLABSHEET_1__';
          break;
        case justTheTwoActors:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_COLLABSHEET_2__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_COLLABSHEET_2+__';
          break;
      }
      break;
    case objectTypeIs(FILE):
      switch (true) {
        case justTheOneActor:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_FILE_1__';
          break;
        case justTheTwoActors:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_FILE_2__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_FILE_2+__';
          break;
      }
      break;
    case objectTypeIs(LINK):
      switch (true) {
        case justTheOneActor:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_LINK_1__';
          break;
        case justTheTwoActors:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_LINK_2__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_LINK_2+__';
          break;
      }
      break;
  }

  /*
  if (objectTypeIs(COLLABDOC)) {
    if (justTheOneActor) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_COLLABDOC_1__';
    } else if (justTheTwoActors) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_COLLABDOC_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_COLLABDOC_2+__';
    }
  } else if (objectTypeIs(COLLABSHEET)) {
    if (justTheOneActor) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_COLLABSHEET_1__';
    } else if (justTheTwoActors) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_COLLABSHEET_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_COLLABSHEET_2+__';
    }
  } else if (objectTypeIs(FILE)) {
    if (justTheOneActor) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_FILE_1__';
    } else if (justTheTwoActors) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_FILE_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_FILE_2+__';
    }
  } else if (objectTypeIs(LINK)) {
    if (justTheOneActor) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_LINK_1__';
    } else if (justTheTwoActors) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_LINK_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_LINK_2+__';
    }
  }
  */

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a content share activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the content share activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateContentShareSummary = function (me, activity, properties) {
  let i18nKey = null;

  const justTheOneObject = isOne(properties.objectCount);
  const justTheTwoObjects = isTwo(properties.objectCount);
  const justTheOneTarget = isOne(properties.targetCount);
  const justTheTwoTargets = isTwo(properties.targetCount);
  const objectTypeIs = pipe(prop(PRIMARY_OBJECT), prop(SUB_TYPE))(activity);

  const targetIsCurrentUser = pipe(prop(TARGET), prop(ID), equals(me.id))(activity);

  if (justTheOneObject) {
    if (objectTypeIs(COLLABDOC)) {
      if (justTheOneTarget) {
        if (targetIsCurrentUser) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_COLLABDOC_YOU__';
        } else {
          i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_COLLABDOC_1__';
        }
      } else if (justTheTwoTargets) {
        i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_COLLABDOC_2__';
      } else {
        i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_COLLABDOC_2+__';
      }
    } else if (objectTypeIs(COLLABSHEET)) {
      if (justTheOneTarget) {
        if (targetIsCurrentUser) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_COLLABSHEET_YOU__';
        } else {
          i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_COLLABSHEET_1__';
        }
      } else if (justTheTwoTargets) {
        i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_COLLABSHEET_2__';
      } else {
        i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_COLLABSHEET_2+__';
      }
    } else if (objectTypeIs(FILE)) {
      if (justTheOneTarget) {
        if (targetIsCurrentUser) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_FILE_YOU__';
        } else {
          i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_FILE_1__';
        }
      } else if (justTheTwoTargets) {
        i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_FILE_2__';
      } else {
        i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_FILE_2+__';
      }
    } else if (objectTypeIs(LINK)) {
      if (justTheOneTarget) {
        if (targetIsCurrentUser) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_LINK_YOU__';
        } else {
          i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_LINK_1__';
        }
      } else if (justTheTwoTargets) {
        i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_LINK_2__';
      } else {
        i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_LINK_2+__';
      }
    }
  } else if (justTheTwoObjects) {
    if (targetIsCurrentUser) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_YOU_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_2__';
    }
  } else if (targetIsCurrentUser) {
    i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_YOU_2+__';
  } else {
    i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a content member role update activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the content members update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateContentUpdateMemberRoleSummary = function (me, activity, properties) {
  let i18nKey = null;

  const targetTypeIs = pipe(prop(TARGET), prop(SUB_TYPE))(activity);
  const justTheOneObject = isOne(properties.objectCount);
  const justTheTwoObjects = isTwo(properties.objectCount);
  const objectIsCurrentUser = pipe(prop(PRIMARY_OBJECT), prop(ID), equals(me.id))(activity);

  if (targetTypeIs(COLLABDOC)) {
    if (justTheOneObject) {
      if (objectIsCurrentUser) {
        i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_COLLABDOC_YOU__';
      } else {
        i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_COLLABDOC_1__';
      }
    } else if (justTheTwoObjects) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_COLLABDOC_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_COLLABDOC_2+__';
    }
  } else if (targetTypeIs(COLLABSHEET)) {
    if (justTheOneObject) {
      if (objectIsCurrentUser) {
        i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_COLLABSHEET_YOU__';
      } else {
        i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_COLLABSHEET_1__';
      }
    } else if (justTheTwoObjects) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_COLLABSHEET_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_COLLABSHEET_2+__';
    }
  } else if (targetTypeIs(FILE)) {
    if (justTheOneObject) {
      if (objectIsCurrentUser) {
        i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_FILE_YOU__';
      } else {
        i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_FILE_1__';
      }
    } else if (justTheTwoObjects) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_FILE_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_FILE_2+__';
    }
  } else if (targetTypeIs(LINK)) {
    if (justTheOneObject) {
      if (objectIsCurrentUser) {
        i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_LINK_YOU__';
      } else {
        i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_LINK_1__';
      }
    } else if (justTheTwoObjects) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_LINK_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_LINK_2+__';
    }
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

const generateRejectedRequestToJoinGroup = function (me, activity, properties) {
  let i18nKey = '__MSG__ACTIVITY_REQUEST_TO_JOIN_GROUP_REJECTED__';
  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of request activity to join a group.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the group update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateRequestToJoinGroupSummary = function (me, activity, properties) {
  let i18nKey = null;

  const justTheOneActor = isOne(properties.actorCount);
  const justTheTwoActors = isTwo(properties.actorCount);
  const actorIsCurrentUser = pipe(prop(ACTOR), prop(ID), equals(me.id))(activity);

  if (justTheOneActor) {
    if (actorIsCurrentUser) {
      i18nKey = '__MSG__ACTIVITY_REQUEST_TO_JOIN_GROUP_YOU__';
    } else {
      i18nKey = '__MSG__ACTIVITY_REQUEST_TO_JOIN_GROUP_1__';
    }
  } else if (justTheTwoActors) {
    i18nKey = '__MSG__ACTIVITY_REQUEST_TO_JOIN_GROUP_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_REQUEST_TO_JOIN_GROUP_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a visibility update activity for a meeting.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the meeting visibility update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateMeetingJitsiUpdateVisibilitySummary = function (me, activity, properties) {
  let i18nKey = null;

  const objectVisibilityIs = pipe(prop(PRIMARY_OBJECT), prop(VISIBILITY), equals)(activity);

  if (objectVisibilityIs(PUBLIC)) {
    i18nKey = '__MSG__ACTIVITY_MEETING_VISIBILITY_PUBLIC__';
  } else if (objectVisibilityIs(LOGGEDIN)) {
    i18nKey = '__MSG__ACTIVITY_MEETING_VISIBILITY_LOGGEDIN__';
  } else {
    i18nKey = '__MSG__ACTIVITY_MEETING_VISIBILITY_PRIVATE__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a meeting member role update activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the meeting member update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateMeetingJitsiUpdateMemberRoleSummary = function (me, activity, properties) {
  let i18nKey = null;

  const justTheOneObject = isOne(properties.objectCount);
  const justTheTwoObjects = isTwo(properties.objectCount);
  const objectIsCurrentUser = pipe(prop(PRIMARY_OBJECT), prop(ID), equals(me.id))(activity);

  if (justTheOneObject) {
    if (objectIsCurrentUser) {
      i18nKey = '__MSG__ACTIVITY_MEETING_UPDATE_MEMBER_ROLE_YOU__';
    } else {
      i18nKey = '__MSG__ACTIVITY_MEETING_UPDATE_MEMBER_ROLE_1__';
    }
  } else if (justTheTwoObjects) {
    i18nKey = '__MSG__ACTIVITY_MEETING_UPDATE_MEMBER_ROLE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_MEETING_UPDATE_MEMBER_ROLE_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a meeting update activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the meeting update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateMeetingJitsiUpdateSummary = function (me, activity, properties) {
  let i18nKey = null;

  const justTheOneActor = isOne(properties.actorCount);
  const justTheTwoActors = isTwo(properties.actorCount);

  if (justTheOneActor) {
    i18nKey = '__MSG__ACTIVITY_MEETING_UPDATE_1__';
  } else if (justTheTwoActors) {
    i18nKey = '__MSG__ACTIVITY_MEETING_UPDATE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_MEETING_UPDATE_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a meeting post activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the meeting message activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateMeetingJitsiMessageSummary = function (me, activity, properties) {
  let i18nKey = null;

  const justTheOneActor = isOne(properties.actorCount);
  const justTheTwoActors = isTwo(properties.actorCount);

  if (justTheOneActor) {
    i18nKey = '__MSG__ACTIVITY_MEETING_MESSAGE_1__';
  } else if (justTheTwoActors) {
    i18nKey = '__MSG__ACTIVITY_MEETING_MESSAGE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_MEETING_MESSAGE_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a content update activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the content update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateContentUpdateSummary = function (me, activity, properties) {
  let i18nKey = null;

  const objectTypeIs = pipe(prop(PRIMARY_OBJECT), prop(SUB_TYPE), equals)(activity);

  if (objectTypeIs(COLLABDOC)) {
    if (properties.actorCount === 1) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_COLLABDOC_1__';
    } else if (properties.actorCount === 2) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_COLLABDOC_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_COLLABDOC_2+__';
    }
  } else if (activity.primaryObject.subType === COLLABSHEET) {
    if (properties.actorCount === 1) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_COLLABSHEET_1__';
    } else if (properties.actorCount === 2) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_COLLABSHEET_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_COLLABSHEET_2+__';
    }
  } else if (activity.primaryObject.subType === FILE) {
    if (properties.actorCount === 1) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_FILE_1__';
    } else if (properties.actorCount === 2) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_FILE_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_FILE_2+__';
    }
  } else if (activity.primaryObject.subType === LINK) {
    if (properties.actorCount === 1) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_LINK_1__';
    } else if (properties.actorCount === 2) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_LINK_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_LINK_2+__';
    }
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a visibility update activity for content.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the content visibility update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateContentUpdateVisibilitySummary = function (me, activity, properties) {
  let i18nKey = null;

  const objectTypeIs = pipe(prop(PRIMARY_OBJECT), prop(SUB_TYPE), equals)(activity);
  const visibilityIs = pipe(prop(PRIMARY_OBJECT), prop(VISIBILITY), equals)(activity);

  switch (true) {
    case objectTypeIs(COLLABDOC):
      switch (true) {
        case visibilityIs(PUBLIC):
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_COLLABDOC_PUBLIC__';
          break;
        case visibilityIs(LOGGEDIN):
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_COLLABDOC_LOGGEDIN__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_COLLABDOC_PRIVATE__';
          break;
      }
      break;
    case objectTypeIs(COLLABSHEET):
      switch (true) {
        case visibilityIs(PUBLIC):
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_COLLABSHEET_PUBLIC__';
          break;
        case visibilityIs(LOGGEDIN):
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_COLLABSHEET_LOGGEDIN__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_COLLABSHEET_PRIVATE__';
          break;
      }
      break;
    case objectTypeIs(FILE):
      switch (true) {
        case visibilityIs(PUBLIC):
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_FILE_PUBLIC__';
          break;
        case visibilityIs(LOGGEDIN):
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_FILE_LOGGEDIN__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_FILE_PRIVATE__';
          break;
      }
      break;
    case objectTypeIs(LINK):
      switch (true) {
        case visibilityIs(PUBLIC):
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_LINK_PUBLIC__';
          break;
        case visibilityIs(LOGGEDIN):
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_LINK_LOGGEDIN__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_LINK_PRIVATE__';
          break;
      }
      break;
  }

  /*
  if (objectTypeIs(COLLABDOC)) {
    if (visibilityIs(PUBLIC)) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_COLLABDOC_PUBLIC__';
    } else if (visibilityIs(LOGGEDIN)) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_COLLABDOC_LOGGEDIN__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_COLLABDOC_PRIVATE__';
    }
  } else if (objectTypeIs(COLLABSHEET)) {
    if (visibilityIs(PUBLIC)) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_COLLABSHEET_PUBLIC__';
    } else if (visibilityIs(LOGGEDIN)) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_COLLABSHEET_LOGGEDIN__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_COLLABSHEET_PRIVATE__';
    }
  } else if (objectTypeIs(FILE)) {
    if (visibilityIs(PUBLIC)) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_FILE_PUBLIC__';
    } else if (visibilityIs(LOGGEDIN)) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_FILE_LOGGEDIN__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_FILE_PRIVATE__';
    }
  } else if (objectTypeIs(LINK)) {
    if (visibilityIs(PUBLIC)) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_LINK_PUBLIC__';
    } else if (visibilityIs(LOGGEDIN)) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_LINK_LOGGEDIN__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_LINK_PRIVATE__';
    }
  }
  */

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a meeting creation activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the meeting creation activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateMeetingJitsiCreateSummary = function (me, activity, properties) {
  let i18nKey = null;

  // Add the target to the activity summary when a targer is present on the
  // activity and the target is not an user different from the current user
  if (properties.targetCount === 1 && !(activity.target.objectType === 'user' && activity.target['oae:id'] !== me.id)) {
    if (activity.target['oae:id'] === me.id) {
      if (properties.objectCount === 1) {
        i18nKey = '__MSG__ACTIVITY_MEETING_CREATE_1_YOU__';
      } else if (properties.objectCount === 2) {
        i18nKey = '__MSG__ACTIVITY_MEETING_CREATE_2_YOU__';
      } else {
        i18nKey = '__MSG__ACTIVITY_MEETING_CREATE_2+_YOU__';
      }
    } else if (activity.target.objectType === 'group') {
      if (properties.objectCount === 1) {
        i18nKey = '__MSG__ACTIVITY_MEETING_CREATE_1_GROUP__';
      } else if (properties.objectCount === 2) {
        i18nKey = '__MSG__ACTIVITY_MEETING_CREATE_2_GROUP__';
      } else {
        i18nKey = '__MSG__ACTIVITY_MEETING_CREATE_2+_GROUP__';
      }
    }
  } else if (properties.objectCount === 1) {
    i18nKey = '__MSG__ACTIVITY_MEETING_CREATE_1__';
  } else if (properties.objectCount === 2) {
    i18nKey = '__MSG__ACTIVITY_MEETING_CREATE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_MEETING_CREATE_2+__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of a meeting share activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the meeting share activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateMeetingJitsiShareSummary = function (me, activity, properties) {
  let i18nKey = null;
  if (properties.objectCount === 1) {
    if (properties.targetCount === 1) {
      if (activity.target['oae:id'] === me.id) {
        i18nKey = '__MSG__ACTIVITY_MEETING_SHARE_YOU__';
      } else {
        i18nKey = '__MSG__ACTIVITY_MEETING_SHARE_1__';
      }
    } else if (properties.targetCount === 2) {
      i18nKey = '__MSG__ACTIVITY_MEETING_SHARE_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_MEETING_SHARE_2+__';
    }
  } else if (properties.objectCount === 2) {
    if (activity.target['oae:id'] === me.id) {
      i18nKey = '__MSG__ACTIVITY_MEETINGS_SHARE_2_YOU__';
    } else {
      i18nKey = '__MSG__ACTIVITY_MEETINGS_SHARE_2__';
    }
  } else if (activity.target['oae:id'] === me.id) {
    i18nKey = '__MSG__ACTIVITY_MEETINGS_SHARE_2+_YOU__';
  } else {
    i18nKey = '__MSG__ACTIVITY_MEETINGS_SHARE_2+__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of an activity for which no specific handling is available. This will
 * use the activity verb to construct the summary.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the unrecognized activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateDefaultSummary = function (me, activity, properties) {
  let i18nKey = null;
  properties.verb = activity.verb;
  if (properties.actorCount === 1) {
    i18nKey = '__MSG__ACTIVITY_DEFAULT_1__';
  } else if (properties.actorCount === 2) {
    i18nKey = '__MSG__ACTIVITY_DEFAULT_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_DEFAULT_2+__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of an add to library activity for a discussion.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the add to discussion library activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateDiscussionAddToLibrarySummary = function (me, activity, properties) {
  let i18nKey = null;
  if (properties.objectCount === 1) {
    i18nKey = '__MSG__ACTIVITY_DISCUSSION_ADD_LIBRARY__';
  } else if (properties.objectCount === 2) {
    i18nKey = '__MSG__ACTIVITY_DISCUSSION_ADD_LIBRARY_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_DISCUSSION_ADD_LIBRARY_2+__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of a discussion creation activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the discussion creation activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateDiscussionCreateSummary = function (me, activity, properties) {
  let i18nKey = null;
  if (properties.objectCount === 1) {
    i18nKey = '__MSG__ACTIVITY_DISCUSSION_CREATE_1__';
  } else if (properties.objectCount === 2) {
    i18nKey = '__MSG__ACTIVITY_DISCUSSION_CREATE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_DISCUSSION_CREATE_2+__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of a discussion post activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the discussion message activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateDiscussionMessageSummary = function (me, activity, properties) {
  let i18nKey = null;
  if (properties.actorCount === 1) {
    i18nKey = '__MSG__ACTIVITY_DISCUSSION_MESSAGE_1__';
  } else if (properties.actorCount === 2) {
    i18nKey = '__MSG__ACTIVITY_DISCUSSION_MESSAGE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_DISCUSSION_MESSAGE_2+__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of a discussion share activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the discussion share activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateDiscussionShareSummary = function (me, activity, properties) {
  let i18nKey = null;
  if (properties.objectCount === 1) {
    if (properties.targetCount === 1) {
      if (activity.target['oae:id'] === me.id) {
        i18nKey = '__MSG__ACTIVITY_DISCUSSION_SHARE_YOU__';
      } else {
        i18nKey = '__MSG__ACTIVITY_DISCUSSION_SHARE_1__';
      }
    } else if (properties.targetCount === 2) {
      i18nKey = '__MSG__ACTIVITY_DISCUSSION_SHARE_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_DISCUSSION_SHARE_2+__';
    }
  } else if (properties.objectCount === 2) {
    if (activity.target['oae:id'] === me.id) {
      i18nKey = '__MSG__ACTIVITY_DISCUSSIONS_SHARE_2_YOU__';
    } else {
      i18nKey = '__MSG__ACTIVITY_DISCUSSIONS_SHARE_2__';
    }
  } else if (activity.target['oae:id'] === me.id) {
    i18nKey = '__MSG__ACTIVITY_DISCUSSIONS_SHARE_2+_YOU__';
  } else {
    i18nKey = '__MSG__ACTIVITY_DISCUSSIONS_SHARE_2+__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of a discussion member role update activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the discussion member update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateDiscussionUpdateMemberRoleSummary = function (me, activity, properties) {
  let i18nKey = null;
  if (properties.objectCount === 1) {
    if (activity.primaryObject['oae:id'] === me.id) {
      i18nKey = '__MSG__ACTIVITY_DISCUSSION_UPDATE_MEMBER_ROLE_YOU__';
    } else {
      i18nKey = '__MSG__ACTIVITY_DISCUSSION_UPDATE_MEMBER_ROLE_1__';
    }
  } else if (properties.objectCount === 2) {
    i18nKey = '__MSG__ACTIVITY_DISCUSSION_UPDATE_MEMBER_ROLE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_DISCUSSION_UPDATE_MEMBER_ROLE_2+__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of a discussion update activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the discussion update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateDiscussionUpdateSummary = function (me, activity, properties) {
  let i18nKey = null;
  if (properties.actorCount === 1) {
    i18nKey = '__MSG__ACTIVITY_DISCUSSION_UPDATE_1__';
  } else if (properties.actorCount === 2) {
    i18nKey = '__MSG__ACTIVITY_DISCUSSION_UPDATE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_DISCUSSION_UPDATE_2+__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of a visibility update activity for a discussion.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the discussion visibility update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateDiscussionUpdateVisibilitySummary = function (me, activity, properties) {
  let i18nKey = null;
  if (activity.primaryObject['oae:visibility'] === 'public') {
    i18nKey = '__MSG__ACTIVITY_DISCUSSION_VISIBILITY_PUBLIC__';
  } else if (activity.primaryObject['oae:visibility'] === 'loggedin') {
    i18nKey = '__MSG__ACTIVITY_DISCUSSION_VISIBILITY_LOGGEDIN__';
  } else {
    i18nKey = '__MSG__ACTIVITY_DISCUSSION_VISIBILITY_PRIVATE__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of an add to folder activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the add to folder activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateFolderAddToFolderSummary = function (me, activity, properties) {
  let i18nKey = null;
  if (properties.objectCount === 1) {
    if (activity.primaryObject.subType === COLLABDOC) {
      i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_FOLDER_COLLABDOC__';
    } else if (activity.primaryObject.subType === FILE) {
      i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_FOLDER_FILE__';
    } else if (activity.primaryObject.subType === LINK) {
      i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_FOLDER_LINK__';
    }
  } else if (properties.objectCount === 2) {
    i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_FOLDER_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_FOLDER_2+__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of an add to library activity for a folder.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the add to folder library activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateFolderAddToLibrarySummary = function (me, activity, properties) {
  let i18nKey = null;
  if (properties.objectCount === 1) {
    i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_LIBRARY__';
  } else if (properties.objectCount === 2) {
    i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_LIBRARY_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_LIBRARY_2+__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of a folder comment activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the folder comment activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateFolderCommentSummary = function (me, activity, properties) {
  let i18nKey = null;
  if (properties.actorCount === 1) {
    i18nKey = '__MSG__ACTIVITY_FOLDER_COMMENT_1__';
  } else if (properties.actorCount === 2) {
    i18nKey = '__MSG__ACTIVITY_FOLDER_COMMENT_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_FOLDER_COMMENT_2+__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of a folder creation activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the folder creation activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateFolderCreateSummary = function (me, activity, properties) {
  let i18nKey = null;
  // Add the target to the activity summary when a target is present on the
  // activity and the target is not a user different from the current user
  if (properties.targetCount === 1 && !(activity.target.objectType === 'user' && activity.target['oae:id'] !== me.id)) {
    if (activity.target['oae:id'] === me.id) {
      if (properties.objectCount === 1) {
        i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_1_YOU__';
      } else if (properties.objectCount === 2) {
        i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_2_YOU__';
      } else {
        i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_2+_YOU__';
      }
    } else if (activity.target.objectType === 'group') {
      if (properties.objectCount === 1) {
        i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_1_GROUP__';
      } else if (properties.objectCount === 2) {
        i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_2_GROUP__';
      } else {
        i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_2+_GROUP__';
      }
    }
  } else if (properties.objectCount === 1) {
    i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_1__';
  } else if (properties.objectCount === 2) {
    i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_2+__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of a folder share activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the folder share activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateFolderShareSummary = function (me, activity, properties) {
  let i18nKey = null;
  if (properties.objectCount === 1) {
    if (properties.targetCount === 1) {
      if (activity.target['oae:id'] === me.id) {
        i18nKey = '__MSG__ACTIVITY_FOLDER_SHARE_YOU__';
      } else {
        i18nKey = '__MSG__ACTIVITY_FOLDER_SHARE_1__';
      }
    } else if (properties.targetCount === 2) {
      i18nKey = '__MSG__ACTIVITY_FOLDER_SHARE_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_FOLDER_SHARE_2+__';
    }
  } else if (properties.objectCount === 2) {
    if (activity.target['oae:id'] === me.id) {
      i18nKey = '__MSG__ACTIVITY_FOLDERS_SHARE_2_YOU__';
    } else {
      i18nKey = '__MSG__ACTIVITY_FOLDERS_SHARE_2__';
    }
  } else if (activity.target['oae:id'] === me.id) {
    i18nKey = '__MSG__ACTIVITY_FOLDERS_SHARE_2+_YOU__';
  } else {
    i18nKey = '__MSG__ACTIVITY_FOLDERS_SHARE_2+__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of a folder update activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the folder update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateFolderUpdateSummary = function (me, activity, properties) {
  let i18nKey = null;
  if (properties.actorCount === 1) {
    i18nKey = '__MSG__ACTIVITY_FOLDER_UPDATE_1__';
  } else if (properties.actorCount === 2) {
    i18nKey = '__MSG__ACTIVITY_FOLDER_UPDATE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_FOLDER_UPDATE_2+__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of a folder member role update activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the folder member update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateFolderUpdateMemberRoleSummary = function (me, activity, properties) {
  let i18nKey = null;
  if (properties.objectCount === 1) {
    if (activity.primaryObject['oae:id'] === me.id) {
      i18nKey = '__MSG__ACTIVITY_FOLDER_UPDATE_MEMBER_ROLE_YOU__';
    } else {
      i18nKey = '__MSG__ACTIVITY_FOLDER_UPDATE_MEMBER_ROLE_1__';
    }
  } else if (properties.objectCount === 2) {
    i18nKey = '__MSG__ACTIVITY_FOLDER_UPDATE_MEMBER_ROLE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_FOLDER_UPDATE_MEMBER_ROLE_2+__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of a visibility update activity for a folder.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the folder visibility update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateFolderUpdateVisibilitySummary = function (me, activity, properties) {
  let i18nKey = null;
  if (activity.primaryObject['oae:visibility'] === 'public') {
    i18nKey = '__MSG__ACTIVITY_FOLDER_VISIBILITY_PUBLIC__';
  } else if (activity.primaryObject['oae:visibility'] === 'loggedin') {
    i18nKey = '__MSG__ACTIVITY_FOLDER_VISIBILITY_LOGGEDIN__';
  } else {
    i18nKey = '__MSG__ACTIVITY_FOLDER_VISIBILITY_PRIVATE__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of an update for a user following another user
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the following activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateFollowingSummary = function (me, activity, properties) {
  let i18nKey = null;
  if (properties.actorCount > 1) {
    if (properties.actorCount === 2) {
      if (activity.primaryObject['oae:id'] === me.id) {
        i18nKey = '__MSG__ACTIVITY_FOLLOWING_2_YOU__';
      } else {
        i18nKey = '__MSG__ACTIVITY_FOLLOWING_2_1__';
      }
    } else if (activity.primaryObject['oae:id'] === me.id) {
      i18nKey = '__MSG__ACTIVITY_FOLLOWING_2+_YOU__';
    } else {
      i18nKey = '__MSG__ACTIVITY_FOLLOWING_2+_1__';
    }
  } else if (properties.objectCount > 1) {
    if (properties.objectCount === 2) {
      i18nKey = '__MSG__ACTIVITY_FOLLOWING_1_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_FOLLOWING_1_2+__';
    }
  } else if (activity.primaryObject['oae:id'] === me.id) {
    i18nKey = '__MSG__ACTIVITY_FOLLOWING_1_YOU__';
  } else {
    i18nKey = '__MSG__ACTIVITY_FOLLOWING_1_1__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of a group member add activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the add group member activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateGroupAddMemberSummary = function (me, activity, properties) {
  let i18nKey = null;
  if (properties.objectCount === 1) {
    if (activity.primaryObject['oae:id'] === me.id) {
      i18nKey = '__MSG__ACTIVITY_GROUP_ADD_MEMBER_YOU__';
    } else {
      i18nKey = '__MSG__ACTIVITY_GROUP_ADD_MEMBER_1__';
    }
  } else if (properties.objectCount === 2) {
    i18nKey = '__MSG__ACTIVITY_GROUP_ADD_MEMBER_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_GROUP_ADD_MEMBER_2+__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of a group member role update activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the group member update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateGroupUpdateMemberRoleSummary = function (me, activity, properties) {
  let i18nKey = null;
  if (properties.objectCount === 1) {
    if (activity.primaryObject['oae:id'] === me.id) {
      i18nKey = '__MSG__ACTIVITY_GROUP_UPDATE_MEMBER_ROLE_YOU__';
    } else {
      i18nKey = '__MSG__ACTIVITY_GROUP_UPDATE_MEMBER_ROLE_1__';
    }
  } else if (properties.objectCount === 2) {
    i18nKey = '__MSG__ACTIVITY_GROUP_UPDATE_MEMBER_ROLE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_GROUP_UPDATE_MEMBER_ROLE_2+__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of a group creation activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the group creation activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateGroupCreateSummary = function (me, activity, properties) {
  let i18nKey = null;
  if (properties.objectCount === 1) {
    i18nKey = '__MSG__ACTIVITY_GROUP_CREATE_1__';
  } else if (properties.objectCount === 2) {
    i18nKey = '__MSG__ACTIVITY_GROUP_CREATE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_GROUP_CREATE_2+__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of a group join activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the group join activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateGroupJoinSummary = function (me, activity, properties) {
  let i18nKey = null;
  if (properties.actorCount === 1) {
    i18nKey = '__MSG__ACTIVITY_GROUP_JOIN_1__';
  } else if (properties.actorCount === 2) {
    i18nKey = '__MSG__ACTIVITY_GROUP_JOIN_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_GROUP_JOIN_2+__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of a group update activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the group update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateGroupUpdateSummary = function (me, activity, properties) {
  let i18nKey = null;
  if (properties.actorCount === 1) {
    i18nKey = '__MSG__ACTIVITY_GROUP_UPDATE_1__';
  } else if (properties.actorCount === 2) {
    i18nKey = '__MSG__ACTIVITY_GROUP_UPDATE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_GROUP_UPDATE_2+__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary of a visibility update activity for a group.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the group visibility update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateGroupUpdateVisibilitySummary = function (me, activity, properties) {
  let i18nKey = null;
  if (activity.primaryObject['oae:visibility'] === 'public') {
    i18nKey = '__MSG__ACTIVITY_GROUP_VISIBILITY_PUBLIC__';
  } else if (activity.primaryObject['oae:visibility'] === 'loggedin') {
    i18nKey = '__MSG__ACTIVITY_GROUP_VISIBILITY_LOGGEDIN__';
  } else {
    i18nKey = '__MSG__ACTIVITY_GROUP_VISIBILITY_PRIVATE__';
  }

  return new ActivityItem(i18nKey, properties);
};

/**
 * Render the end-user friendly, internationalized summary related to invitation activities. The
 * blueprint for the invitation activity should be of the form:
 *
 *  * Only one actor
 *  * Only one object, it must be a user (either who is invited, or who is accepting)
 *  * Multiple targets of the same resource type (either the resources to which a user is being
 *    invited, or is accepting an invitation)
 *
 * The resulting summary will have the standard actor/object/target properties, as well as a
 * summary i18n key of the form:
 *
 *  `ACTIVITY_${activityLabel}_${whoLabel}_${resourceType}_${numTargets}`
 *
 * Which renders all the following i18n key possibilities:
 *
 *  * ACTIVITY_INVITE_COLLABDOC_1
 *  * ACTIVITY_INVITE_FILE_1
 *  * ACTIVITY_INVITE_LINK_1
 *  * ACTIVITY_INVITE_CONTENT_2
 *  * ACTIVITY_INVITE_CONTENT_2+
 *  * ACTIVITY_INVITE_DISCUSSION_1
 *  * ACTIVITY_INVITE_DISCUSSION_2
 *  * ACTIVITY_INVITE_DISCUSSION_2+
 *  * ACTIVITY_INVITE_FOLDER_1
 *  * ACTIVITY_INVITE_FOLDER_2
 *  * ACTIVITY_INVITE_FOLDER_2+
 *  * ACTIVITY_INVITE_GROUP_1
 *  * ACTIVITY_INVITE_GROUP_2
 *  * ACTIVITY_INVITE_GROUP_2+
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_COLLABDOC_1
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_FILE_1
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_LINK_1
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_CONTENT_2
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_CONTENT_2+
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_DISCUSSION_1
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_DISCUSSION_2
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_DISCUSSION_2+
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_FOLDER_1
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_FOLDER_2
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_FOLDER_2+
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_GROUP_1
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_GROUP_2
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_GROUP_2+
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_COLLABDOC_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_FILE_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_LINK_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_CONTENT_2
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_CONTENT_2+
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_DISCUSSION_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_DISCUSSION_2
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_DISCUSSION_2+
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_FOLDER_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_FOLDER_2
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_FOLDER_2+
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_GROUP_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_GROUP_2
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_GROUP_2+
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_COLLABDOC_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_FILE_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_LINK_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_CONTENT_2
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_CONTENT_2+
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_DISCUSSION_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_DISCUSSION_2
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_DISCUSSION_2+
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_FOLDER_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_FOLDER_2
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_FOLDER_2+
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_GROUP_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_GROUP_2
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_GROUP_2+
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the invite activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateInvitationSummary = function (me, activity, properties) {
  const labels = ['ACTIVITY'];
  const activityType = activity['oae:activityType'];
  const actorId = activity.actor['oae:id'];
  const objectId = activity.primaryObject['oae:id'];

  if (activityType === 'invite') {
    labels.push('INVITE');
  } else if (activityType === 'invitation-accept') {
    labels.push('INVITATION_ACCEPT');

    // Find the "who" label, which indicates if the current user in context is either the
    // inviter or the invited user. When that is the case, we alter the language to be in
    // the form "You"/"Your" as opposed to the display name of the user. This is only
    // applicable for the invitation accept activity because the invite is only seen by the
    // user who was invited
    if (me.id === actorId) {
      labels.push('YOU_OTHER');
    } else if (me.id === objectId) {
      labels.push('OTHER_YOU');
    } else {
      labels.push('OTHER_OTHER');
    }
  } else {
    throw new Error('Invalid activity type provided for invitation activity: ' + activityType);
  }

  // Find the count label
  let countLabel = properties.targetCount;
  if (countLabel > 2) {
    countLabel = '2+';
  }

  // Find any target object so we can inspect its `objectType` or `resourceSubType`
  let target = null;
  if (countLabel === 1) {
    target = activity.target;
  } else {
    target = activity.target['oae:collection'][0];
  }

  // Find the type label (e.g., LINK, DISCUSSION, GROUP, etc...)
  let typeLabel = target.objectType.toUpperCase();
  if (typeLabel === 'CONTENT' && countLabel === 1) {
    typeLabel = target.subType.toUpperCase();
  }

  // Gather the rest of the labels together to form the i18n key
  labels.push(typeLabel);
  labels.push(countLabel);

  // Generate the activity i18n key according to the labels we determined
  const i18nKey = '__MSG__' + labels.join('_') + '__';

  return new ActivityItem(i18nKey, properties);
};

export { generateSummary };
