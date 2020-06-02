const GITHUB_ORG = 'nuz-app';
const GITHUB_PROJECT = 'nuz';
const GITHUB_URL = `https://github.com/${GITHUB_ORG}/${GITHUB_PROJECT}`

module.exports = {
  title: 'Nuz',
  tagline: 'Nuz is an ecosystem to manage runtime packages for web platform',
  url: 'https://docs.nuz.app',
  baseUrl: '/',
  favicon: 'images/favicon.ico',
  organizationName: 'nuz-app', // Usually your GitHub org/user name.
  projectName: 'nuz', // Usually your repo name.
  themeConfig: {
    gtag: {
      trackingID: process.env.GA_DOCUMENT_ID,
    },
    algolia: {
      apiKey: process.env.ALGOLIA_API_KEY,
      indexName: process.env.ALGOLIA_INDEX_NAME,
    },
    navbar: {
      title: 'Nuz',
      logo: {
        alt: 'Nuz Logo',
        src: 'images/logo.png',
      },
      links: [
        {
          to: 'docs/doc1',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        { to: 'blog', label: 'Blog', position: 'left' },
        {
          href: GITHUB_URL,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: 'docs/introduction',
            },
            {
              label: 'Second Doc',
              to: 'docs/doc2',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/nuz',
            },
            {
              label: 'Spectrum Chat',
              href: 'https://spectrum.chat/nuz',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: 'blog',
            },
            {
              label: 'GitHub',
              href: GITHUB_URL,
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Nuz Project, Inc. Built with Docusaurus ❤️.`,
      // Display update user, ex: Last updated by <Author Name>
      enableUpdateBy: true,
      // Display update time, ex: Last updated on <date>
      enableUpdateTime: true,
      // Display scroll to top button
      scrollToTop: true,
      // Clean up
      // https://docusaurus.io/docs/en/site-config.html#cleanurl-boolean
      cleanUrl: true,
      stylesheets: [
        'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600&display=swap',
      ],
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            `${GITHUB_URL}/edit/develop/website/`,
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            `${GITHUB_URL}/edit/develop/website/blog/`,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  // plugins: [
  //   [
  //     '@docusaurus/plugin-ideal-image',
  //     {
  //       quality: 85,
  //       max: 1030, // max resized image's size.
  //       min: 640, // min resized image's size. if original is lower, use that size.
  //       steps: 2, // the max number of images generated between min and max (inclusive)
  //     },
  //   ],
  // ],
};
