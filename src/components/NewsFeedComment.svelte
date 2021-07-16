<script>
  /**
   * TODOs
   * - [ ] instead of fetching comment author over and over, cache it somehow
   * - [x] use avatar placeholder in comment (nothing shows when not defined)
   */

  import { formatDistance } from 'date-fns';
  import { onMount, afterUpdate } from 'svelte';
  import { defaultToTemplateAvatar } from '../helpers/utils';
  import { avatars } from '../stores/users';

  let commenterAvatar;
  // let allCommenters = [];
  export let comment;

  onMount(async () => {
    /**
     * if comment author is someone else other than current user
     * let's fetch her avatar image and store it as cache in a store
     */
    const userIsCached = $avatars.has(comment.author.id);
    let pictureSet;
    if (userIsCached) {
      pictureSet = $avatars.get(comment.author.id);
      commenterAvatar = defaultToTemplateAvatar(pictureSet.small);

      // TODO debug
      // console.log('user ' + comment.author.displayName + ' was cache, returning!');
    } else {
      // TODO debug
      // console.log('fetching user ' + comment.author.displayName + ' from Hilary!');

      fetch(comment.author.apiUrl)
        .then(data => data.json())
        .then(data => data.picture)
        .then(pictureSet => {
          avatars.addEntry(comment.author.id, pictureSet);
          commenterAvatar = defaultToTemplateAvatar(pictureSet.small);
        });
    }
    // commenterAvatar = await getAvatar(comment.author, userIsCached);
    // commenterAvatar = defaultToTemplateAvatar(commenterAvatar.small);
  });

  afterUpdate(async () => {});
</script>

<section class="comment-section">
  <img class="commenter-avatar" alt="avatar" src={commenterAvatar} />

  <a href={comment.author.profilePath}>
    {comment.author.displayName}
  </a>
  <span class="level{comment.level}-indentation">{comment.content}</span>
  <span class="smaller">
    {formatDistance(comment.published, new Date(), { addSuffix: true })}
  </span>
</section>

<style lang="scss">
  .commenter-avatar {
    max-height: 40px;
    max-width: 40px;
  }

  .comment-section {
    margin-top: 20px;
    border: dashed #035 1px;
  }

  .level0-indentation {
    padding-left: 20px;
  }

  .level1-indentation {
    padding-left: 40px;
  }

  .smaller {
    font-size: smaller;
  }
</style>
