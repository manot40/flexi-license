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
  private keys: string[];

  constructor(query: Query, keys: string[]) {
    this.keys = keys;
    this.query = query;
  }

  public getSelect(override?: { [key: string]: boolean }) {
    const select: any = override || {};

    if (typeof this.query.fields == 'string') {
      const split = this.query.fields.split(',');
      const trimmed = split.map((item) => item.trim().replace('-', ''));
      const filtered = trimmed.filter((key) => this.keys.includes(key));

      if (filtered.length) {
        const isInverse = split[0].startsWith('-');
        (isInverse ? this.keys : filtered).forEach((key) => {
          select[key] = isInverse ? !filtered.includes(key) : true;
        });
      }
    } else if (override) {
      this.keys.forEach((key) => {
        select[key] = true;
      });
    } else {
      return undefined;
    }

    return { ...select, ...override };
  }

  public getWhere() {
    const where: any = {};

    Object.keys(this.query).forEach((key) => {
      if (this.keys.includes(key)) {
        const val = (this.query[key] as string)?.split(':');
        if (val[0]) where[key] = { [val[1] || 'contains']: val[0] };
      }
    });

    return where;
  }

  public getOrderBy() {
    const orderBy: any = {};

    if (typeof this.query.order !== 'string') return undefined;

    const split = this.query.order.split(',').map((item) => item.trim().split(':'));
    const filtered = split.filter((item) => this.keys.includes(item[0]));

    if (!filtered.length) return undefined;

    filtered.forEach((item) => {
      orderBy[item[0]] = item[1] === 'desc' ? 'desc' : 'asc';
    });

    return orderBy;
  }
}
