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

declare type CreateUpdateParams<T = any> = {
  id?: string;
  body: T;
  user: User;
};

declare type User = Omit<import('@prisma/client').User, 'password'>;

declare type License = import('@prisma/client').License;

declare type Company = import('@prisma/client').Company;

declare type Product = import('@prisma/client').Product;

declare type LicenseWithCompany = License & { company: Company };

declare type LicenseReqFlow = {
  id: string;
  url: string;
  name: string | null;
  businessKey: string | null;
  suspended: boolean;
  ended: boolean;
  processDefinitionId: string;
  processDefinitionUrl: string;
  activityId: null;
  startedBy: string;
  started: string;
  variables: any[];
  callbackId: string | null;
  callbackType: string | null;
  tenantId: string;
  completed: boolean;
};
