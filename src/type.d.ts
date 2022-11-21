declare type EntityType<T extends Promise> = Awaited<ReturnType<T>>[0];

declare type ResData<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

declare type Res<T> = {
  success: boolean;
  message: string;
  result: T;
  paginate?: {
    totalPage: number;
    total: number;
    page: number;
  };
};

declare type User = Omit<import('@prisma/client').User, 'password'>;

declare type License = import('@prisma/client').License;

declare type Company = import('@prisma/client').Company;

declare type LicenseWithCompany = License & { company: Company };
