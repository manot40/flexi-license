declare type EntityType<T extends Promise> = Awaited<ReturnType<T>>[0];

declare type ResData<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

declare type User = {
  id: number;
  username: string;
  role: string;
  isActive: boolean;
};

declare type Res<T> = {
  success: boolean;
  message: string;
  result: T;
};
