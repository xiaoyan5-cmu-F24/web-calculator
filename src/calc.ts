const evaluateMath = (sanitizedExpression: string): number => {
    // Simple math expression evaluator
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call
    const result = new Function(`"use strict"; return (${sanitizedExpression})`)() as number;
    return result;
};

export { evaluateMath };
