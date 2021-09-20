## Tracker Blocker [![Build](https://github.com/sharmad-nachnolkar/tracker-blocking-browser-extension/actions/workflows/build.yml/badge.svg)](https://github.com/sharmad-nachnolkar/tracker-blocking-browser-extension/actions/workflows/build.yml) [![Unit Tests](https://github.com/sharmad-nachnolkar/tracker-blocking-browser-extension/actions/workflows/test.yml/badge.svg)](https://github.com/sharmad-nachnolkar/tracker-blocking-browser-extension/actions/workflows/test.yml) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier) [![eslint: airbnb](https://badgen.net/badge/eslint/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)

Tracker Blocker is a browser extension which works across multiple browsers to prevent online trackers from tracking your activity across your web visits.
For more details read the [technical spec](https://github.com/sharmad-nachnolkar/tracker-blocking-browser-extension/blob/gh-pages/Tracker%20Blocker%20Extension%20-%20Tech%20Spec.pdf) based on which this product was built and the [flow diagram](https://miro.com/app/board/o9J_lxKZR4I=/) of the product.

[Download the tech spec pdf](https://sharmad-nachnolkar.github.io/tracker-blocking-browser-extension/Tracker%20Blocker%20Extension%20-%20Tech%20Spec.pdf)

Also refer to the deviations from technical spec section below to take a note of the changes which were done in implementation phase and the reasons for them.

![Screenshot of Tracker Blocker](https://sharmad-nachnolkar.github.io/tracker-blocking-browser-extension/Tracker_Browser_Extension.png)

Watch the [video](https://www.loom.com/share/14831f37bcf64dd4a06ee63145896af4) of this extension running on Firefox.

---
### Steps to run the project 
 1. Clone the [project](https://github.com/sharmad-nachnolkar/tracker-blocking-browser-extension) from github 
 2. Run `npm install`
 3. Run `npm run build-dev`
 4. Open the browser you want to run the extension in and load unpacked files from **dist folder.** In case of firefox a **zip file** is needed which can be found in the **builds folder** as **build.zip**

*To create the production build (optimised) run* - `npm run build-prod` 

 ---
 ### List of commands

 - `npm run build-dev` - To run webpack develoment build
 - `npm run build-prod` - To run webpack production build
 - `npm run test` - To run jest unit tests
 - `npm run lint` - To run eslint on `src` folder
 - `npm run prettify` - To run prettier on `src` folder

---
### System Requirements
This project needs node versions >= 10.x.x and npm >= 7.x.x

---
###  Limitations / Known Issues

 1. Currently the blocked trackers are internally tracked and displayed to the user at a `tab` level. Hence if user is navigating to multiple sites in the same tab, user will see the entire blocked tracker history on that tab. Can add a feature for user to see which trackers are blocked in the currently opened site.
 2. The build is not tested in Safari since running a local build in Safari needs a XCode build. However since the project used the standard [WebExtensions APIs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Browser_support_for_JavaScript_APIs) which are supported in Safari (>= 14), the build should be usable in Safari as well as is or with minor tweaks.
 3. This extension is tested in Firefox, Chrome, Edge browsers. However, an exhaustive testing across different versions of these browsers can be done by using tools like BrowserStack.
 4. Currently `beacon` type requests are not intercepted. This is because chromium based browser use `ping` and does not support `beacon`. A conditional browser based check needs to be added to support `beacon` request on on Firefox.
 5. This extensions has not been tested on mobile version of browsers.


---
### Technical deviations from [tech spec](https://github.com/sharmad-nachnolkar/tracker-blocking-browser-extension/blob/gh-pages/Tracker%20Blocker%20Extension%20-%20Tech%20Spec.pdf) and reasons

 1. Jest is used as the testing framework instead of Karma and Jasmine which was originally proposed in tech spec. This decision was taken because of easier and quick setup of Jest and also faster running of tests in node environment rather than spawning a browser. 
 2. Tracker matching function made as a utility (`utils/trackerUtils.js`) rather than making it part of tracker model (`models/trackers.js`). This decision was taken so as to keep the matching utility pure of any class variables and thus easily test it by providing a range of inputs (`utils/trackerUtils.test.js`). Since this logic is the core functionality of the extension, it is critical to keep it easily testable.
 3. `background.js` is split into `events.js` and `alarms.js` for more modularity and readability.

---
### Technologies 
##### Implemented
 1. Javascript (ES6 with babel transpilation)
 2. Build process using webpack and loaders (babel-loader) and plugins (terser-webpack-plugin, filemanager-webpack-plugin, copy-webpack-plugin)
 3. [ESlint with airbnb plugin](https://github.com/airbnb/javascript) to follow standard coding guidelines
 4. [Prettier](https://github.com/prettier/prettier) to follow standard code formatting
 5. Unit tests for core utilities with [Jest](https://github.com/facebook/jest) and babel-jest plugin
 6. Github actions integration to run unit tests
 7. Pre-commit checks using [husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged) to prevent accidental commits 

##### Need to add in next phase
 1. [Commit lint](https://github.com/conventional-changelog/commitlint) for standardizing commit messages and auto updating package version based on commit type.
 2. [Semantic release](https://github.com/semantic-release/semantic-release) for managing versions of package.
 3. Enhance unit test coverage for `models/trackers.js`, `utils/tabUtils.js`, `background.js`, `events.js`, `popup.js`.
 4. Add test coverage reports to Jest.
 5. Setup end to end tests using Selenium, Codecept or Cypress.
 6. [JSDoc](https://github.com/jsdoc/jsdoc) integration with [Github actions](https://github.com/andstor/jsdoc-action) to collate all documentation in source code to a separate folder.
 7. Use integrations with cross browser testing tools like [BrowserStack](https://www.browserstack.com/integrations) to automatically [test extension](https://www.browserstack.com/docs/automate/selenium/add-plugins-extensions-remote-browsers#introduction) in multiple browser environments.
 8. Integrate with open source tools like [self hosted Sentry](https://develop.sentry.dev/self-hosted/) for error monitoring
 9. Integrate with a backend service to capture logs and analytics like blocked trackers logs, performance logs etc.

---
### Technical References
 - https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API
 - https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest
 - https://github.com/duckduckgo/duckduckgo-privacy-extension
 - https://github.com/EFForg/privacybadger

---
### Development Environment and Extensions
This project was developed in VS Code IDE. However any IDE can be used. The extensions for productivity and ease of development are listed below. As a further step the `.vscode` config folder can be committed to the github repository to follow a uniform development environment across contributors of the project.
 - VS Code
	 - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
	 - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

---
### Future Work
Further improvements can be done to enhance privacy of users by preventing fingerprinting, disabling FLoC API, click to load for social widgets, using surrogate scripts to prevent sites from breaking, allowing user to report broken pages etc. can taken up. These are listed in the **Future Scope** section in the [technical document](https://github.com/sharmad-nachnolkar/tracker-blocking-browser-extension/blob/gh-pages/Tracker%20Blocker%20Extension%20-%20Tech%20Spec.pdf).

---

