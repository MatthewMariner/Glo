import { Icon } from './lib/chakra';
import { MdLock } from 'react-icons/md';

// Auth Imports
import { IRoute } from './types/navigation';

const routes: IRoute[] = [
  {
    name: 'Admin Pages',
    path: '/admin',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    collapse: true,
    items: [
      {
        name: 'ChatGPT Pre-Prompt Management',
        layout: '/admin',
        path: '/prompts',
      },
      {
        name: 'Glo User Prompt Management',
        layout: '/admin',
        path: '/userprompts',
      },
      {
        name: 'Glo User Management',
        layout: '/admin',
        path: '/overview',
      },
    ],
  },
];

export default routes;
