export function buildDynamicWhereClause(
    filters: Record<string, any>
): { where: string; params: any[] } {
    let where = 'where 1 = 1';
    const params: any[] = [];

    const operatorMap: Record<string, string> = {
        eq: '=',
        neq: '!=',
        lt: '<',
        lte: '<=',
        gt: '>',
        gte: '>=',
        ilike: 'ilike',
        like: 'like',
        in: 'in',
        notin: 'not in',
        isnull: 'is null',
        notnull: 'is not null',
    };

    for (const [key, value] of Object.entries(filters)) {
        let field = '';
        let op = 'eq'; // default operator

        const parts = key.split('.');

        if (parts.length === 3) {
            // format: alias.field.operator
            field = `${parts[0]}.${parts[1]}`;
            op = parts[2];
        } else if (parts.length === 2) {
            const [maybeAliasOrField, maybeOp] = parts;
            if (operatorMap[maybeOp]) {
                // format: field.operator (no alias)
                field = maybeAliasOrField;
                op = maybeOp;
            } else {
                // format: alias.field (default operator)
                field = `${maybeAliasOrField}.${maybeOp}`;
            }
        } else if (parts.length === 1) {
            // format: field (no alias, default op)
            field = parts[0];
        } else {
            continue; // skip jika format salah
        }

        const sqlOperator = operatorMap[op];
        if (!sqlOperator) continue;

        // 👉 Cek apakah field-nya kemungkinan UUID (misal: users.id, id, etc.)
        const dbField = field.endsWith('.id') || field === 'id'
            ? `${field}::text`
            : field;

        if (sqlOperator === 'is null' || sqlOperator === 'is not null') {
            where += ` and ${dbField} ${sqlOperator}`;
            continue;
        }

        if ((sqlOperator === 'in' || sqlOperator === 'not in') && Array.isArray(value)) {
            const placeholders = value.map((_, i) => `$${params.length + i + 1}`).join(', ');
            where += ` and ${dbField} ${sqlOperator} (${placeholders})`;
            params.push(...value);
            continue;
        }

        where += ` and ${dbField} ${sqlOperator} $${params.length + 1}`;
        if (sqlOperator === 'ilike' || sqlOperator === 'like') {
            params.push(`%${value}%`);
        } else {
            params.push(value);
        }
    }

    return { where, params };
}
