import { neon } from '@neondatabase/serverless';

type Row = Record<string, any>;

function translate(input: string) {
  let text = input;
  const ignore = /INSERT\s+OR\s+IGNORE\s+INTO/i.test(text);
  if (ignore) {
    text = text.replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, 'INSERT INTO');
    if (!/\bON\s+CONFLICT\b/i.test(text)) text = `${text} ON CONFLICT DO NOTHING`;
  }
  text = text.replace(/\bMAX\(\s*0\s*,/gi, 'GREATEST(0,');
  text = text.replace(/SET\s+quantity\s*=\s*quantity\s*\+\s*excluded\.quantity/gi, 'SET quantity=cart_items.quantity+excluded.quantity');
  let n = 0;
  return text.replace(/\?/g, () => `$${++n}`);
}

export function createD1Shim(connectionString: string) {
  const client = neon(connectionString);

  function stmt(source: string, params: any[] = []) {
    const text = translate(source);
    const query = () => client.query(text, params);
    return {
      bind: (...args: any[]) => stmt(source, args),
      first: async <T = Row>() => {
        const rows = (await query()) as Row[];
        return (rows[0] ?? null) as T | null;
      },
      all: async <T = Row>() => {
        const rows = (await query()) as T[];
        return { results: rows, success: true, meta: {} };
      },
      run: async () => {
        await query();
        return { success: true, meta: {} };
      },
      __text: text,
      __params: params,
      __promise: () => query(),
    };
  }

  return {
    prepare: (source: string) => stmt(source),
    batch: async (statements: any[]) => {
      if (!statements.length) return [];
      const results = await client.transaction(statements.map((s) => s.__promise()));
      return results.map((rows: any) => ({ results: rows, success: true, meta: {} }));
    },
  };
}
