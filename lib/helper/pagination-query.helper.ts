import { buildDynamicWhereClause } from "./convert-filter.helper";
import { PrismaClient } from "@prisma/client";

interface BuildPaginatedQueryOptions {
    payload: Record<string, any>;
    tableName: string;
    dataSource: PrismaClient;
    selectFields?: string;
    defaultSortBy?: string;
    serviceName?: string;
    responseHelper: {
        handleSuccess: Function;
        handleError: Function;
    };
    baseQuery?: string;
    groupBy?: string;
}

export async function buildPaginatedQuery({
    payload,
    tableName,
    dataSource,
    selectFields = `${tableName}.*`,
    defaultSortBy = 'created_at',
    serviceName = 'Service',
    responseHelper,
    baseQuery,
    groupBy = '',
}: BuildPaginatedQueryOptions) {
    const { page = 1, limit = 20, sortBy, sortOrder, ...filters } = payload;

    const take = limit;
    const skip = (page - 1) * take;

    try {
        const { where, params } = buildDynamicWhereClause(filters);

        let orderBy = `order by ${defaultSortBy} desc`;
        if (sortBy) {
            const order = sortOrder === 'asc' ? 'asc' : 'desc';
            orderBy = ` order by ${sortBy} ${order}`;
        }

        const stmtQueryBase = baseQuery?.trim()
            ? `${baseQuery.trim()} ${where} ${groupBy}`.trim()
            : `select ${selectFields} from ${tableName} ${where} ${groupBy}`.trim();

        const stmtQuery = `
        select * from (${stmtQueryBase}) as row
        ${orderBy}
        limit ${take} offset ${skip}
      `;

        const stmtQueryCount = `
        select count(*) as total_row
        from (${stmtQueryBase}) as row
      `;

        const [res, totalData] = await Promise.all([
            dataSource.$queryRawUnsafe(stmtQuery, ...params),
            dataSource.$queryRawUnsafe(stmtQueryCount, ...params),
        ]);

        return responseHelper.handleSuccess(
            res,
            `${serviceName.replace('Service', '')} fetched successfully`,
            +page,
            parseInt((totalData as any)[0].total_row, 10),
            +payload.limit || 10,
        );
    } catch (error) {
        return responseHelper.handleError(error, `${serviceName}.getAll`);
    }
}
