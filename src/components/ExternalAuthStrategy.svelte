<script lang="ts">
  import anylogger from 'anylogger';
  import { onMount } from 'svelte';
  import { redirectUrl, invitationInfo } from '../stores/user';

  const log = anylogger('external-auth-strategy');

  export let name: string;
  export let id: string;
  export let url: string;
  export let icon: string;
  let invitationToken: string;
  let invitationEmail: string;

  onMount(async () => {
    // Variable that keeps track of the invitation info that is available in the page context, if any
    invitationToken = $invitationInfo.token;
    invitationEmail = $invitationInfo.email;

    // TODO debug
    log.warn(`redirectUrl: ${redirectUrl}`);
    log.warn(`invitation info: ${invitationEmail} / ${invitationToken}`);
  });

  const submitForm = (e: Event) => {
    // TODO
    log.warn('Here I go, using external auth again...');
  };
</script>

<form on:submit|preventDefault={submitForm} action={url} method="POST" class="btn-group">
  <input type="hidden" name="invitationToken" bind:value={invitationToken} />
  <input type="hidden" name="invitationEmail" bind:value={invitationEmail} />
  <input type="hidden" name="redirectUrl" bind:value={$redirectUrl} />

  <div>
    <button on:click={submitForm} href="/" class={`${id} button is-light signIn-button is-multiline`}>
      <span class="icon">
        <i class={icon} />
      </span>
      <span>{name}</span>
    </button>
  </div>
</form>

<style lang="scss">
  .btn-group {
    margin: 1em 0 0.5em 4.5em;
  }

  .signIn-button {
    margin-bottom: 0;
    
    &:hover {
    box-shadow: 0 1px 3px rgba(206, 212, 218, 1);
    }
  }

  .icon {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .button.is-multiline {
    min-width: 75%;
    height: 25px;
    white-space: unset;
  }
</style>
