export const extractNumberedFields = <T>(
    source: Record<string, any>,
    fieldName: string
): T[] => {
    const result: T[] = [];
    const regex = new RegExp(`^${fieldName}(\\d+)$`);

    for (const [key, value] of Object.entries(source)) {
        const match = key.match(regex);
        if (match) {
            // Ensure the value is not already an array, or flatten if necessary
            if (Array.isArray(value)) {
                result.push(...(value as T[])); // Flatten array
            } else if (value != "") {
                result.push(value as T);
            }
        }
    }

    return result;
};
