# Cake

## Getting Started

To start building, clone this repo to a new directory:

```bash
npm install
```

Now launch a dev server:

```bash
npm start
```

## Production

To build for production, run:

```bash
npm run build
```

A production build includes:

- Minified code bundles
- Generated Service workers
- App manifest

## Development

Use `http://guest.oae.com?url=%2F%3FinvitationToken%3DhA7EFd5wYudH%26invitationEmail%3Dmiguel.laginha%2540apereo.org` for testing manually, based on the `cake-integration` branch on Hilary.

## Unit Tests

To run the unit tests once, run:

```bash
npm test
```

To run the unit tests and watch for file changes during development, run:

```bash
npm run test.watch
```

## Testing your PWA's performance

We recommend using https://www.webpagetest.org/easy with the `Run Lighthouse Audit` option turned on.
This will give you an in depth look into your app's load performance on the average device connected to the average network.
For more info on how to use webpagetest check out [this article](https://zoompf.com/blog/2015/07/the-seo-experts-guide-to-web-performance-using-webpagetest-2)
