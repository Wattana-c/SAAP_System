jest.mock('../src/configs/db', () => {
    return {
        poolPromise: Promise.resolve({
            request: () => ({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({ recordset: [] })
            }),
            close: jest.fn().mockResolvedValue(true)
        }),
        sql: {
            NVarChar: jest.fn(),
            Decimal: jest.fn(),
            MAX: 'MAX'
        }
    };
});
