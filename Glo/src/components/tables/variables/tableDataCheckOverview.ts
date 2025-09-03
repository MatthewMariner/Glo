type RowObj = {
  email: string;
  role: string;
  date: string | Date;
  edit: string;
  emailVerified: boolean;
};

const tableDataCheck: RowObj[] = [
  {
    email: '@vld.mihalache',
    role: 'Expert+',
    date: 'May 24, 2023',
    edit: 'false',
    emailVerified: false,
  },

  {
    email: '@adelaparkson',
    role: 'Basic',
    date: 'May 18, 2023',
    edit: 'true',
    emailVerified: false,
  },
];

export default tableDataCheck;
