declare type ResolvePrisma<T extends Promise> = Awaited<ReturnType<T>>;

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

declare type Req<T> = T & {
  user: User;
};

declare type Res<T> = {
  success: boolean;
  message: string;
  data?: T;
};
