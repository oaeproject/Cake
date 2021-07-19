<script>
  /**
   * TODOs
   * - [ ] instead of fetching comment author over and over, cache it somehow
   * - [x] use avatar placeholder in comment (nothing shows when not defined)
   */

  import { formatDistance } from 'date-fns';
  import { onMount, afterUpdate } from 'svelte';
  import { defaultToTemplateAvatar } from '../helpers/utils';
  import { cachedFetch } from '../stores/users';

  let commenterAvatar;
  export let comment;

  onMount(async () => {
    commenterAvatar = defaultToTemplateAvatar((await cachedFetch(comment.author.id, comment.author.apiUrl)).small);
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
