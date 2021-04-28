<script lang="ts">
  import { onMount } from "svelte";
  import { useNavigate, useLocation, useFocus } from "svelte-navigator";
  import { getCurrentUser, user } from "../stores/user";
  import anylogger from "anylogger";

  let isChecking = true;

  const log = anylogger("private-route-guard");
  const navigate = useNavigate();
  const location = useLocation();
  const registerFocus = useFocus();

  const navigateToLogin = () => {
    navigate("/login" + $location.search, {
      state: { from: $location.pathname },
      replace: true,
    });
  };

  onMount(async () => {
    try {
      user.set(await getCurrentUser());
    } catch {
      navigateToLogin();
    } finally {
      isChecking = false;
    }
  });

  $: if (!$user.isLoggedIn && !isChecking) {
    log.info("Redirecting user to login window");
    navigateToLogin();
  }
</script>

{#if $user.isLoggedIn && !isChecking}
  <slot {registerFocus} />
{/if}

{#if isChecking}
  <p>Checking auth status...</p>
{/if}
