# Cake

Experimental new frontend for OAE

## Get started

Install the dependencies...

```bash
npm install
```

...then start [Rollup](https://rollupjs.org):

```bash
npm run dev
```

## Development

Use `http://guest.oae.com` for testing.

Use `http://guest.oae.com?url=%2F%3FinvitationToken%3DhA7EFd5wYudH%26invitationEmail%3Dmiguel.laginha%2540apereo.org` for testing invitations and other url parameters.

If you're using [Visual Studio Code](https://code.visualstudio.com/) we recommend installing the official extension [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) along with several others:

- [ESlint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [i18n Ally](https://marketplace.visualstudio.com/items?itemName=lokalise.i18n-ally)
- [Babel](https://marketplace.visualstudio.com/items?itemName=mgmcdermott.vscode-language-babel)
- [Svelte intellisense](https://marketplace.visualstudio.com/items?itemName=ardenivanov.svelte-intellisense)
- [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome) or [Debugger for Firefox](https://marketplace.visualstudio.com/items?itemName=firefox-devtools.vscode-firefox-debug)
- [Stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)

(The official [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension is included in [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode))

Here are some settings you might need (paste them onto `settings.json`):

```
  "[svelte]": {
    "editor.defaultFormatter": "svelte.svelte-vscode"
  },
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  },
  "eslint.validate": ["javascript", "svelte"],
  "svelte.plugin.typescript.enable": false,
  "svelte.plugin.svelte.format.enable": true,
  "svelte.plugin.svelte.enable": true,
  "css.validate": false,
  "less.validate": false,
  "scss.validate": false,
```

## Tests and validations

Run translation tests (node) with `npm run test-translations`.

Run svelte-check with `npm run validate`.

Run linting check with `npm run lint`.

Run (S)CSS linting with `npm run lint:css`.

## Debugging

With VSCode use the following configuration (`launch.json`):

```
    {
      "name": "Launch Chrome",
      "type": "chrome",
      "request": "launch",
      "sourceMaps": true,
      "url": "http://guest.oae.com",
      "webRoot": "${workspaceFolder}/www"
    },
    {
      "name": "Launch Firefox",
      "type": "firefox",
      "request": "launch",
      "reAttach": true,
      "reloadOnAttach": true,
      "url": "http://guest.oae.com",
      "webRoot": "${workspaceFolder}/www"
    }
```

## Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```

You can run the newly built app with `npm run start`. This uses [sirv](https://github.com/lukeed/sirv), which is included in your package.json's `dependencies` so that the app will work when you deploy to platforms like [Heroku](https://heroku.com).

## Deploying to the web

### With [Vercel](https://vercel.com)

Install `vercel` if you haven't already:

```bash
npm install -g vercel
```

Then, from within your project folder:

```bash
cd public
vercel deploy --name my-project
```

### With [surge](https://surge.sh/)

Install `surge` if you haven't already:

```bash
npm install -g surge
```

Then, from within your project folder:

```bash
npm run build
surge public my-project.surge.sh
```

## Testing your PWA's performance

We recommend using https://www.webpagetest.org/easy with the `Run Lighthouse Audit` option turned on.
This will give you an in depth look into your app's load performance on the average device connected to the average network.
For more info on how to use webpagetest check out [this article](https://zoompf.com/blog/2015/07/the-seo-experts-guide-to-web-performance-using-webpagetest-2)
