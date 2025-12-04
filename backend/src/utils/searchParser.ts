
import { Prisma } from '@prisma/client';

type ConditionMap = Record<string, { field: string; value: string; type?: string }>;

export class SearchExpressionParser {
    private pos = 0;
    private tokens: string[] = [];
    private conditions: ConditionMap;

    constructor(expression: string, conditions: ConditionMap) {
        this.conditions = conditions;
        // Tokenize: split by operators but keep them
        // Operators: +, ×, Not, [, ], (, )
        // Identifiers: S\d+
        // We need to handle spaces
        const regex = /(S\d+)|(\+)|(×)|(Not)|(\[)|(\])|(\()|(\))/g;
        this.tokens = expression.match(regex) || [];
    }

    public parse(): Prisma.PatentWhereInput {
        this.pos = 0;
        if (this.tokens.length === 0) return {};
        const result = this.parseExpression();
        if (this.pos < this.tokens.length) {
            throw new Error('Unexpected token at end of expression');
        }
        return result;
    }

    private peek(): string | undefined {
        return this.tokens[this.pos];
    }

    private consume(expected?: string): string {
        const token = this.tokens[this.pos];
        if (expected && token !== expected) {
            throw new Error(`Expected ${expected} but found ${token}`);
        }
        this.pos++;
        return token;
    }

    // Expression -> Term { "+" Term }  (OR)
    private parseExpression(): Prisma.PatentWhereInput {
        let left = this.parseTerm();

        while (this.peek() === '+') {
            this.consume('+');
            const right = this.parseTerm();
            left = { OR: [left, right] };
        }

        return left;
    }

    // Term -> Factor { "×" Factor } (AND)
    private parseTerm(): Prisma.PatentWhereInput {
        let left = this.parseFactor();

        while (this.peek() === '×') {
            this.consume('×');
            const right = this.parseFactor();
            left = { AND: [left, right] };
        }

        return left;
    }

    // Factor -> "Not" "[" Expression "]" | "(" Expression ")" | Identifier
    private parseFactor(): Prisma.PatentWhereInput {
        const token = this.peek();

        if (token === 'Not') {
            this.consume('Not');
            this.consume('[');
            const expr = this.parseExpression();
            this.consume(']');
            return { NOT: expr };
        } else if (token === '(') {
            this.consume('(');
            const expr = this.parseExpression();
            this.consume(')');
            return expr;
        } else if (token && token.startsWith('S')) {
            return this.parseIdentifier();
        } else {
            throw new Error(`Unexpected token: ${token}`);
        }
    }

    private parseIdentifier(): Prisma.PatentWhereInput {
        const id = this.consume();
        const condition = this.conditions[id];
        if (!condition) {
            throw new Error(`Condition ${id} not found`);
        }

        // Map condition to Prisma WhereInput
        return this.mapConditionToPrisma(condition);
    }

    private mapConditionToPrisma(condition: { field: string; value: string; type?: string }): Prisma.PatentWhereInput {
        const { field, value } = condition;

        // Map frontend field names to database columns
        const fieldMap: Record<string, string> = {
            'document': 'documentNum',
            'application': 'applicationNum',
            'applicationDate': 'applicationDate', // Needs date handling
            'publicationDate': 'publicationDate', // Needs date handling
            'inventionName': 'inventionTitle',
            'applicant': 'applicantName',
            // Add more as needed
        };

        const dbField = fieldMap[field] || field;

        // Handle Date fields
        if (field === 'applicationDate' || field === 'publicationDate') {
            // Assuming value is YYYY-MM-DD or similar. 
            // For simple search, maybe exact match or range?
            // Let's assume exact match for now or string contains if it's stored as string?
            // In DB it is DateTime. 
            // If user inputs "2023", we might want range.
            // For now, let's try to parse as date.
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return { [dbField]: { equals: date } };
            }
            // If invalid date, maybe ignore or throw?
            return {};
        }

        // Default string contains
        return {
            [dbField]: {
                contains: value,
                // mode: 'insensitive' // Optional: case insensitive
            },
        };
    }
}
