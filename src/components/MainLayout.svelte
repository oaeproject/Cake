<script lang="ts">
  import Sidebar from "../components/Sidebar.svelte";
</script>

<div class="container main-container">
  <div class="columns columns-container">
    <div class="column is-one-fifth sidebar">
      <div class="menu sticky">
        <Sidebar />
      </div>
    </div>
    <div class="column main-wrapper">
      <div class="column is-three-fifths main-content">
        <slot />
      </div>
      <div class="column options" />
    </div>
  </div>
</div>

<style lang="scss">
</style>
