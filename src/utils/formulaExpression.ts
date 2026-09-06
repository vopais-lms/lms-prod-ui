export const FORMULA_OPS = ['+', '-', '*', '/', '%', '**'] as const;
export type FormulaOp = (typeof FORMULA_OPS)[number];

export type FormulaValue =
    | { kind: 'parameter'; field: string }
    | { kind: 'number'; value: number };

export type FormulaGroup = {
    kind: 'group';
    items: FormulaChainItem[];
};

export type FormulaExpr = FormulaValue | FormulaGroup;

export type FormulaChainItem = {
    expr: FormulaExpr;
    op?: FormulaOp;
};

const PRECEDENCE: Record<FormulaOp, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '%': 2,
    '**': 3,
};

export function isFormulaOp(token: string | number): token is FormulaOp {
    return FORMULA_OPS.includes(String(token) as FormulaOp);
}

export function emptyFormulaGroup(): FormulaGroup {
    return { kind: 'group', items: [{ expr: { kind: 'parameter', field: '' } }] };
}

export function emptyFormulaValue(): FormulaValue {
    return { kind: 'parameter', field: '' };
}

function shouldPop(top: FormulaOp, incoming: FormulaOp): boolean {
    if (incoming === '**') return PRECEDENCE[top] > PRECEDENCE[incoming];
    return PRECEDENCE[top] >= PRECEDENCE[incoming];
}

function flattenGroupToInfix(group: FormulaGroup, wrap: boolean): Array<string | number> {
    const tokens: Array<string | number> = [];
    if (wrap) tokens.push('(');
    group.items.forEach((item, index) => {
        if (item.expr.kind === 'group') {
            tokens.push(...flattenGroupToInfix(item.expr, true));
        } else if (item.expr.kind === 'parameter') {
            tokens.push(item.expr.field);
        } else {
            tokens.push(item.expr.value);
        }
        if (item.op && index < group.items.length - 1) {
            tokens.push(item.op);
        }
    });
    if (wrap) tokens.push(')');
    return tokens;
}

export function infixTokensToPostfix(tokens: Array<string | number>): Array<string | number> {
    const output: Array<string | number> = [];
    const ops: Array<FormulaOp | '('> = [];

    for (const token of tokens) {
        if (token === '(') {
            ops.push('(');
            continue;
        }
        if (token === ')') {
            while (ops.length > 0 && ops[ops.length - 1] !== '(') {
                output.push(ops.pop() as FormulaOp);
            }
            if (ops[ops.length - 1] === '(') ops.pop();
            continue;
        }
        if (isFormulaOp(token)) {
            while (
                ops.length > 0 &&
                ops[ops.length - 1] !== '(' &&
                shouldPop(ops[ops.length - 1] as FormulaOp, token)
            ) {
                output.push(ops.pop() as FormulaOp);
            }
            ops.push(token);
            continue;
        }
        output.push(token);
    }

    while (ops.length > 0) {
        const next = ops.pop();
        if (next && next !== '(') output.push(next);
    }
    return output;
}

export function groupToPostfix(group: FormulaGroup): Array<string | number> {
    return infixTokensToPostfix(flattenGroupToInfix(group, false));
}

function tokenToValue(token: string | number): FormulaValue {
    if (typeof token === 'number') return { kind: 'number', value: token };
    return { kind: 'parameter', field: String(token) };
}

export function postfixToGroup(tokens: Array<string | number>): FormulaGroup {
    const stack: FormulaExpr[] = [];

    for (const token of tokens) {
        if (isFormulaOp(token)) {
            const right = stack.pop() ?? emptyFormulaValue();
            const left = stack.pop() ?? emptyFormulaValue();
            stack.push({
                kind: 'group',
                items: [
                    { expr: left, op: token },
                    { expr: right },
                ],
            });
            continue;
        }
        stack.push(tokenToValue(token));
    }

    const result = stack[0] ?? emptyFormulaValue();
    if (result.kind === 'group') return result;
    return { kind: 'group', items: [{ expr: result }] };
}

export function formatFormulaOp(op: FormulaOp): string {
    return op === '**' ? '^' : op;
}

export function formatFormulaExpr(
    expr: FormulaExpr,
    parameterName: (field: string) => string,
): string {
    if (expr.kind === 'parameter') {
        return expr.field ? parameterName(expr.field) : 'parameter';
    }
    if (expr.kind === 'number') {
        return String(expr.value);
    }
    const inner = expr.items
        .map((item, index) => {
            const piece = formatFormulaExpr(item.expr, parameterName);
            if (item.op && index < expr.items.length - 1) {
                return `${piece} ${formatFormulaOp(item.op)}`;
            }
            return piece;
        })
        .join(' ');
    return `(${inner})`;
}

export function validateFormulaGroup(group: FormulaGroup): string | null {
    if (group.items.length === 0) {
        return 'Add at least one parameter or number.';
    }

    for (let index = 0; index < group.items.length; index += 1) {
        const item = group.items[index];
        const isLast = index === group.items.length - 1;
        if (!isLast && !item.op) {
            return 'Each term except the last needs an operator.';
        }
        if (item.expr.kind === 'parameter' && String(item.expr.field).trim() === '') {
            return 'Select a parameter for every parameter term.';
        }
        if (item.expr.kind === 'group') {
            const nested = validateFormulaGroup(item.expr);
            if (nested) return nested;
        }
    }
    return null;
}
