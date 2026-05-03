// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Quest Desk — Техническая документация', 
  url: 'https://Dolgoddrod007.github.io',
  baseUrl: 'https://github.com/Dolgoddrod007/quest-desk.git',
  organizationName: 'Dolgoddrod007', // Usually your GitHub org/user name.
  projectName: '/quest-desk/', // Usually your repo name.
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  trailingSlash: false,
  deploymentBranch: 'gh-pages',

   plugins: [
    'docusaurus-plugin-image-zoom', 
    ['drawio', {}],
  ],

  presets: [
    [
      'classic',
      {
        blog: false,
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: 'docs',
          remarkPlugins: [require('@akebifiky/remark-simple-plantuml')],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
    [
      'redocusaurus',
      {
        specs: [
          {
            id: 'quest-desk-api',
            spec: 'static/api/quest_desk.yaml',
            route: '/api/',
          },
        ],
        theme: {
          primaryColor: '#1890ff',
        },
      },
    ],
  ],


  themeConfig: {
    navbar: {
      title: 'Quest Desk',
      items: [
        { to: '/docs/intro', label: 'Документация', position: 'left' },
        { to: '/api/', label: 'API', position: 'left' },
        {
          href: 'https://github.com/Dolgoddrod007/quest-desk',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Документация',
          items: [
            { label: 'О проекте', to: '/docs/intro' },
            { label: 'Требования', to: '/docs/requirements/functional/uc01-registration' },
            { label: 'API', to: '/api/' },
          ],
        },
        {
          title: 'Прочее',
          items: [
            { label: 'Репозиторий', href: 'https://github.com/Dolgoddrod007/quest-desk' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Quest Desk. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;
