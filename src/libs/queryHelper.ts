type Query = { [key: string]: string | string[] | undefined };

export function pagination(query: Query, total: number) {
  const { page: _page, limit: _limit } = query;

  const page = _page ? parseInt(_page.toString()) : 1;
  const take = _limit ? parseInt(_limit.toString()) : 10;

  const totalPage = Math.ceil(total / take);
  const skip = take * (page - 1);

  return {
    page,
    skip,
    take,
    total,
    totalPage,
  };
}

export default class QueryHelper {
  private query: Query;
  private omit: string[];

  constructor(query: Query, keysToOmit?: string[]) {
    this.query = query;
    this.omit = keysToOmit || [];
  }

  public getSelect() {
    const select: any = {};

    if (typeof this.query.fields != 'string') return undefined;

    const split = this.query.fields.split(',');
    const trimmed = split.map((item) => item.trim().replace('-', ''));
    const filtered = trimmed.filter((key) => key && !this.omit.includes(key));

    if (!filtered.length) return undefined;

    filtered.forEach((key) => {
      select[key] = true;
    });

    return select;
  }

  public getWhere() {
    const where: any = {};

    Object.keys(this.query)
      .filter((k) => !/(order|fields|page)/i.test(k))
      .forEach((key) => {
        if (!this.omit.includes(key)) {
          const val = (this.query[key] as string)?.split(':');
          if (val[0]) where[key] = { [val[1] || 'contains']: val[0] };
        }
      });

    return where;
  }

  public getOrderBy() {
    const orderBy: any = [];

    if (typeof this.query.order !== 'string') return { createdAt: 'desc' };

    const split = this.query.order.split(',').map((item) => item.trim().split(':'));
    const filtered = split.filter((item) => !this.omit.includes(item[0]));

    if (!filtered.length) return undefined;

    filtered.forEach((item) => {
      orderBy.push({ [item[0] || 'createdAt']: item[1] === 'desc' ? 'desc' : 'asc' });
    });

    return orderBy;
  }

  public parseData(body: any, keys: string[]) {
    const data: any = {};

    Object.keys(body).forEach((key) => {
      if (keys.includes(key)) {
        data[key] = body[key];
      }
    });

    return data;
  }
}
