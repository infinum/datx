/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

const siteConfig = {
  title: 'datx', // Title for your website.
  tagline: 'An opinionated data store',
  url: 'https://datx.dev', // Your website URL
  baseUrl: '/', // Base URL for your project */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: 'datx',
  organizationName: 'infinum',
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  // It will include custom domain into build folder and prevent github
  // to override it to the github pages address
  cname: 'datx.dev',

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    { doc: 'getting-started/installation', label: 'Docs' },
    { doc: 'examples/basic-setup', label: 'Examples' },
    { href: 'https://github.com/infinum/datx', label: 'GitHub' },
    { search: true },
  ],
  algolia: {
    // setup DocSearch by algolia first
    apiKey: 'f03607e57957ae747b2342443460477a',
    indexName: 'datx',
  },

  // If you have users set above, you add it here:
  users: [],

  /* path to images for header/footer */
  headerIcon: 'img/datx-logo.svg',
  footerIcon: '',
  favicon: 'img/favicon.ico',

  /* Colors for website */
  colors: {
    primaryColor: '#D8252C',
    secondaryColor: '#043359',
    headerBackground: '#fff',
    darkGray: '#353535',
    lightGray: '#e0e0e0',
    gray: '#8B8B8B',
  },
  scrollToTop: true,

  /* Custom fonts for website */
  // fonts: {
  //   myFont: ["Times New Roman", "Serif"],
  //   myOtherFont: ["-apple-system", "system-ui"]
  // },

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} infinum`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'atom-one-dark',
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: [
    'https://buttons.github.io/buttons.js',
    'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.0/clipboard.min.js',
    '/js/code-block-buttons.js',
  ],
  stylesheets: ['/css/code-block-buttons.css'],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,

  // Open Graph and Twitter card images.
  ogImage: 'img/undraw_online.svg',
  twitterImage: 'img/undraw_tweetstorm.svg',

  // For sites with a sizable amount of content, set collapsible to true.
  // Expand/collapse the links and subcategories under categories.
  docsSideNavCollapsible: true,

  // Show documentation's last contributor's name.
  enableUpdateBy: true,

  // Show documentation's last update time.
  enableUpdateTime: true,

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  //   repoUrl: 'https://github.com/facebook/test-site',
};

module.exports = siteConfig;
