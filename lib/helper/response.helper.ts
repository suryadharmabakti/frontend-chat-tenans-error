export class ResponseHelper {
    private static log(message: any, context?: string) {
        console.error(`[${context || 'Error'}]:`, message);
    }

    static formatResponse({
        success,
        statusCode,
        message,
        data,
        page,
        totalData,
        pageSize,
        amount,
        customData,
    }: {
        success: boolean;
        statusCode: number;
        message: string;
        data?: unknown;
        page?: number;
        totalData?: number;
        pageSize?: number;
        amount?: number;
        customData?: unknown;
    }) {
        const response: Record<string, any> = {
            success,
            statusCode,
            message,
        };

        if (data !== undefined) response.data = data;
        if (page !== undefined) response.page = page;
        if (totalData !== undefined) response.totalData = totalData;
        if (pageSize !== undefined) response.pageSize = pageSize;
        if (amount !== undefined) response.amount = amount;
        if (customData !== undefined) response.customData = customData;

        return response;
    }

    static handleSuccess(
        data: unknown,
        message = 'Success',
        page?: number,
        totalData?: number,
        pageSize?: number,
        statusCode = 200,
        customData?: unknown,
    ) {
        return this.formatResponse({
            success: true,
            statusCode,
            message,
            data,
            customData,
            page,
            totalData,
            pageSize,
        });
    }

    static errorResponse(
        message = 'An error occurred',
        statusCode = 500,
        errors: unknown = null,
    ) {
        return this.formatResponse({
            success: false,
            statusCode,
            message,
            data: errors,
        });
    }

    static handleError(error: any, context?: string, message?: string) {
        this.log(message || error.message, context);
        const errMessage = message || error.message || 'Internal Server Error';

        let displayError =
            process.env.NODE_ENV === 'development'
                ? error
                : 'Internal Server Error';

        return {
            success: false,
            statusCode: error.statusCode || 500,
            message: errMessage,
            error: displayError,
        };
    }
}
