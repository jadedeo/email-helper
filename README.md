# Email Helper

**San Francisco Recreation & Parks**\
_2025 MHCI Capstone_

## [Demo Video 7.11.25](https://drive.google.com/file/d/1ISjtgeS06fAfZKRHPG4_cJV7OEPZCvo_/view?usp=sharing)

Styling is a bit off at the moment, please disregard!

## Tech Stack

-   [Vite](https://vite.dev/)
-   [Vue 3 (Composition API)](https://vuejs.org/)
-   [TipTap](https://tiptap.dev/product/editor)
-   [Tailwind CSS](https://tailwindcss.com/)
-   [Vue Material Design Icons](https://www.npmjs.com/package/vue-material-design-icons)

## Requirements

This extension is intended for desktop use. It utilizes Manifest 3 & is supported by Chromium browsers (Chrome, Edge, Opera, etc.)

In order to use the mailTo feature, users must configure a default mail app for their desktop.

To build and run the application locally, users must first install [npm & NodeJS](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm); they should follow the downloading instructions according to their operating system.

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

    ![Manage Extensions](/public/manageExtensions.png)

2. Toggle 'Developer Mode' on & select 'Load Unpacked'

    ![Dev Mode & Load Unpacked](/public/loadUnpacked.png)

3. Navigate to the application folder within your file system & select the dist folder you just generated

    ![Select dist](/public/selectDist.png)

4. Find extension in toolbar & click to run (pin, if desired)

    ![Launch Extension](/public/launchExtension.png)
