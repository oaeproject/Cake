<script>
  import { Router, Route } from "svelte-navigator";
  import PrivateRoute from "./routes/PrivateRoute.svelte";

  import Homepage from "./routes/Homepage.svelte";
  import Dashboard from "./routes/Dashboard.svelte";
  import Library from "./routes/Library.svelte";
  import Groups from "./routes/Groups.svelte";

  /**
   * A Route path can match parameters with "path/:parameterName" and wildcards with "path/*" or "path/*wildcardName". All parameters and wildcard values will be provided to the component as props. They can also be accessed inside a Route slot via let:params.

   * The Route component will also receive the current location, as well as the navigate function, that is scoped to the current Route as props. They can be accessed inside the Route slot, via let:location and let:navigate.
  */
</script>

<Router>
  <Route useFocus path="/">
    <Homepage goToLogin="false" />
  </Route>
  <Route path="/login">
    <Homepage goToLogin="true" />
  </Route>
  <PrivateRoute path="dashboard">
    <Dashboard />
  </PrivateRoute>
  <PrivateRoute path="library">
    <Library />
  </PrivateRoute>
  <PrivateRoute path="groups">
    <Groups />
  </PrivateRoute>
</Router>
