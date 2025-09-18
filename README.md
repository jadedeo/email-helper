# Email Helper

**San Francisco Recreation & Parks**\
_2025 MHCI Capstone_

## Tech Stack

-   [Vite](https://vite.dev/)
-   [Vue 3 (Composition API)](https://vuejs.org/)
-   [TipTap](https://tiptap.dev/product/editor)
-   [Tailwind CSS](https://tailwindcss.com/)
-   [Vue Material Design Icons](https://www.npmjs.com/package/vue-material-design-icons)
-   [AJV (JSON Schema Validator)](https://ajv.js.org/)

## Requirements

This extension is intended for desktop use. It utilizes Manifest 3 & is supported by Chromium browsers (Chrome, Edge, Opera, etc.)

The mailTo feature requires a users desktop mail app - if something other than the default app is desired, this should be configured in settings.

To build and run the application locally, users must first install [npm & NodeJS](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) by following the downloading instructions according to their operating system. The following set-up instructions also assume the ability to use Git.

## Cloning Repository

Clone the project repository via the terminal/command line using its web URL:

```bash
$ git clone https://github.com/jadedeo/email-helper.git
```

For more information, visit [GitHub Docs | Cloning a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository)

## Installing Dependencies

To generate a production version of the extension that can be loaded into the browser, navigate into the app repo and ance inside, run the following command.

```bash
$ npm install && npm run build
```

Within the app repo, you should now see a 'dist' folder.

## Run Extension in Developer Mode

For demo purposes, the following illustrates the process of running a browser extension in dev mode within Edge. The steps are very similar for doing the same in Chrome.

1. Navigate to the 'Manage Extensions' page

    ![Manage Extensions](/public/readmeImages/manageExtensions.png)

2. Toggle 'Developer Mode' on & select 'Load Unpacked'

    ![Dev Mode & Load Unpacked](/public/readmeImages/loadUnpacked.png)

3. Navigate to the application folder within your file system & select the dist folder you just generated

    ![Select dist](/public/readmeImages/selectDist.png)

4. Find extension in toolbar & click to run (pin, if desired)

    ![Launch Extension](/public/readmeImages/launchExtension.png)
