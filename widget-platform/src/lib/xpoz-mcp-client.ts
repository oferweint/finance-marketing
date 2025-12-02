/**
 * XPOZ MCP Client
 *
 * Connects directly to the XPOZ MCP server using the Model Context Protocol.
 * This allows the widget platform to fetch real social media data.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import yaml from 'js-yaml';

// Types for XPOZ MCP responses
export interface XpozTwitterPost {
  id: string;
  text: string;
  authorUsername: string;
  authorId?: string;
  createdAtDate: string;
  retweetCount: number;
  replyCount: number;
  quoteCount?: number;
  impressionCount?: number;
  bookmarkCount?: number;
  hashtags?: string[];
  mentions?: string[];
  lang?: string;
}

export interface XpozPaginatedResponse {
  results: XpozTwitterPost[];
  pagination: {
    totalRows: number;
    totalPages: number;
    resultsCount: number;
    pageSize: number;
    tableName: string;
  };
  dataDumpExportOperationId?: string;
}

export interface XpozOperationResult {
  operationId: string;
  status: 'running' | 'completed' | 'failed';
  data?: XpozPaginatedResponse;
}

// Configuration
// XPOZ MCP endpoint from https://glama.ai/mcp/servers/@atyachin/Xpoz
const XPOZ_MCP_URL = process.env.XPOZ_MCP_URL || 'https://mcp.xpoz.ai/mcp';
const XPOZ_ACCESS_KEY = process.env.XPOZ_ACCESS_KEY || '';

// Singleton client instance
let mcpClient: Client | null = null;
let connectionPromise: Promise<Client> | null = null;

/**
 * Get or create the MCP client connection
 */
async function getClient(): Promise<Client> {
  if (mcpClient) {
    return mcpClient;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    const client = new Client({
      name: 'widget-platform',
      version: '1.0.0',
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization if access key is provided
    if (XPOZ_ACCESS_KEY) {
      headers['Authorization'] = `Bearer ${XPOZ_ACCESS_KEY}`;
    }

    // Use Streamable HTTP transport for /mcp endpoint
    const transport = new StreamableHTTPClientTransport(
      new URL(XPOZ_MCP_URL),
      {
        requestInit: { headers },
      }
    );

    await client.connect(transport);
    console.log('Connected to XPOZ MCP at', XPOZ_MCP_URL);

    mcpClient = client;
    return client;
  })();

  return connectionPromise;
}

/**
 * Parse XPOZ custom response format
 * Handles both simple key-value YAML and the complex results format
 */
function parseXpozResponse(text: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Check if this is a simple status response (e.g., "running")
  if (text.trim() === 'running') {
    return { status: 'running' };
  }

  // Try standard YAML parsing first
  try {
    const yamlParsed = yaml.load(text) as Record<string, unknown>;
    if (yamlParsed && typeof yamlParsed === 'object') {
      console.log(`[XPOZ MCP] YAML parsed successfully, keys:`, Object.keys(yamlParsed));

      // Handle nested data structure
      if (yamlParsed.data && typeof yamlParsed.data === 'object') {
        const data = yamlParsed.data as Record<string, unknown>;

        // Check if results is a number (countTweets response)
        if (typeof data.results === 'number') {
          return { success: true, results: data.results };
        }

        // Check if results is an array (posts response)
        if (Array.isArray(data.results)) {
          return { success: true, results: data.results, pagination: data.pagination };
        }
      }

      return yamlParsed;
    }
  } catch (e) {
    console.log(`[XPOZ MCP] Standard YAML parsing failed, trying custom parser`);
  }

  // Custom parser for XPOZ-specific format with results[100]{fields}:
  const lines = text.split('\n');
  const resultsData: Record<string, unknown>[] = [];
  let fieldsOrder: string[] = [];
  let inResults = false;
  let inPagination = false;
  const pagination: Record<string, unknown> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for results array header like "results[100]{id,text,authorUsername,...}:"
    const resultsMatch = trimmed.match(/^results\[(\d+)\]\{([^}]+)\}:$/);
    if (resultsMatch) {
      fieldsOrder = resultsMatch[2].split(',');
      inResults = true;
      inPagination = false;
      continue;
    }

    // Check for pagination section
    if (trimmed === 'pagination:') {
      inPagination = true;
      inResults = false;
      continue;
    }

    // Parse pagination fields (indented under pagination:)
    if (inPagination && line.startsWith('    ')) {
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmed.slice(0, colonIndex).trim();
        let value: string | number = trimmed.slice(colonIndex + 1).trim();
        // Remove quotes
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        // Parse numbers
        if (/^\d+$/.test(value)) {
          value = parseInt(value, 10);
        }
        pagination[key] = value;
      }
      continue;
    }

    // Check for simple key: value (top level)
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex > 0 && !inResults && !inPagination) {
      const key = trimmed.slice(0, colonIndex).trim();
      let value: string | number | boolean = trimmed.slice(colonIndex + 1).trim();

      // Remove quotes
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      // Parse booleans
      if (value === 'true') value = true as unknown as string;
      else if (value === 'false') value = false as unknown as string;
      // Parse numbers
      else if (/^\d+$/.test(value)) value = parseInt(value, 10) as unknown as string;

      result[key] = value;
    }

    // Parse CSV-like result rows (indented lines in results section)
    if (inResults && line.startsWith('    ')) {
      // Parse CSV-like row: "id",text,author,num,num,"date"
      const values = parseCSVRow(trimmed);
      if (values.length === fieldsOrder.length) {
        const row: Record<string, unknown> = {};
        fieldsOrder.forEach((field, i) => {
          let val: unknown = values[i];
          // Parse numbers
          if (typeof val === 'string' && /^\d+$/.test(val)) {
            val = parseInt(val, 10);
          }
          row[field] = val;
        });
        resultsData.push(row);
      }
    }
  }

  if (resultsData.length > 0) {
    result.results = resultsData;
  }

  if (Object.keys(pagination).length > 0) {
    result.pagination = pagination;
  }

  // Also look for dataDumpExportOperationId which might be at the top level
  const dumpMatch = text.match(/dataDumpExportOperationId:\s*(\S+)/);
  if (dumpMatch) {
    result.dataDumpExportOperationId = dumpMatch[1];
  }

  console.log(`[XPOZ MCP] Custom parsed keys:`, Object.keys(result), `results count:`, resultsData.length, `pagination:`, pagination);
  return result;
}

/**
 * Parse a CSV-like row handling quoted values
 */
function parseCSVRow(row: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (char === '"' && (i === 0 || row[i - 1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }

  // Push last value
  values.push(current.trim().replace(/^"|"$/g, ''));

  return values;
}

/**
 * Call an XPOZ MCP tool
 */
async function callTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
  const client = await getClient();

  console.log(`[XPOZ MCP] Calling tool: ${toolName}`, JSON.stringify(args).slice(0, 200));

  try {
    const result = await client.callTool({
      name: toolName,
      arguments: args,
    });

    console.log(`[XPOZ MCP] Tool ${toolName} result type:`, typeof result.content, Array.isArray(result.content) ? `array[${result.content.length}]` : '');

    // Parse content from MCP response
    if (Array.isArray(result.content) && result.content.length > 0) {
      const firstItem = result.content[0] as Record<string, unknown>;

      if (typeof firstItem === 'object' && firstItem !== null && 'text' in firstItem) {
        const text = String(firstItem.text);
        console.log(`[XPOZ MCP] Text content (first 200):`, text.slice(0, 200));

        // Try JSON first
        try {
          const parsed = JSON.parse(text);
          console.log(`[XPOZ MCP] Parsed JSON keys:`, Object.keys(parsed));
          return parsed;
        } catch {
          // Parse XPOZ custom format
          return parseXpozResponse(text);
        }
      }
    }

    console.log(`[XPOZ MCP] Returning raw content`);
    return result.content;
  } catch (error) {
    console.error(`[XPOZ MCP] Error calling ${toolName}:`, error);
    throw error;
  }
}

/**
 * Poll for operation completion
 * XPOZ operations can take 30-90 seconds for large queries
 */
async function waitForOperation(operationId: string, maxAttempts = 45): Promise<unknown> {
  console.log(`[XPOZ MCP] Waiting for operation: ${operationId}`);

  for (let i = 0; i < maxAttempts; i++) {
    const result = await callTool('checkOperationStatus', { operationId });

    if (typeof result === 'object' && result !== null) {
      const data = result as Record<string, unknown>;

      // Check for successful completion
      if (data.status === 'completed' || data.success) {
        console.log(`[XPOZ MCP] Operation completed after ${(i + 1) * 2}s: ${operationId}`);
        return data.data || data;
      }

      // Check for failure
      if (data.status === 'failed') {
        throw new Error(`Operation failed: ${operationId}`);
      }

      // Log progress every 10 seconds
      if (i > 0 && i % 5 === 0) {
        console.log(`[XPOZ MCP] Still waiting... ${i * 2}s elapsed for ${operationId}`);
      }
    }

    // Wait 2 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error(`Operation timed out after ${maxAttempts * 2}s: ${operationId}`);
}

/**
 * Search Twitter posts by keywords with pagination support
 */
export async function searchTwitterPosts(
  query: string,
  options: {
    fields?: string[];
    startDate?: string;
    endDate?: string;
    limit?: number;
    pages?: number; // Number of pages to fetch (default 1, max 10)
  } = {}
): Promise<XpozTwitterPost[]> {
  const pagesToFetch = Math.min(options.pages || 1, 10); // Cap at 10 pages (1000 posts)

  const args: Record<string, unknown> = {
    query,
    userPrompt: `Search for posts about ${query}`,
    fields: options.fields || [
      'id', 'text', 'authorUsername', 'createdAtDate',
      'retweetCount', 'replyCount', 'quoteCount'
    ],
  };

  if (options.startDate) args.startDate = options.startDate;
  if (options.endDate) args.endDate = options.endDate;

  const result = await callTool('getTwitterPostsByKeywords', args);

  // Handle async operation
  if (typeof result === 'object' && result !== null) {
    const data = result as Record<string, unknown>;
    if (data.operationId) {
      const opResult = await waitForOperation(data.operationId as string);
      const response = opResult as {
        results?: XpozTwitterPost[];
        pagination?: { tableName: string; totalPages: number; totalRows: number }
      };

      let allResults = response.results || [];

      // Fetch additional pages if requested and available
      if (pagesToFetch > 1 && response.pagination?.tableName) {
        const { tableName, totalPages } = response.pagination;
        const maxPage = Math.min(pagesToFetch, totalPages);

        // Fetch pages 2 through maxPage using bulk fetch
        if (maxPage > 1) {
          console.log(`[XPOZ MCP] Fetching pages 2-${maxPage} from table ${tableName}`);
          const additionalArgs: Record<string, unknown> = {
            query,
            userPrompt: `Fetch additional pages for ${query}`,
            fields: args.fields,
            tableName,
            pageNumber: 2,
            pageNumberEnd: maxPage,
          };

          const additionalResult = await callTool('getTwitterPostsByKeywords', additionalArgs);
          if (typeof additionalResult === 'object' && additionalResult !== null) {
            const addData = additionalResult as Record<string, unknown>;
            if (addData.operationId) {
              const addOpResult = await waitForOperation(addData.operationId as string);
              const addResponse = addOpResult as { results?: XpozTwitterPost[] };
              if (addResponse.results) {
                allResults = [...allResults, ...addResponse.results];
                console.log(`[XPOZ MCP] Total posts after pagination: ${allResults.length}`);
              }
            }
          }
        }
      }

      return allResults;
    }
    if (data.results) {
      return (data as { results: XpozTwitterPost[] }).results;
    }
  }

  return [];
}

/**
 * Count tweets for a phrase (simple, no OR support)
 */
export async function countTweets(
  phrase: string,
  options: { startDate?: string; endDate?: string } = {}
): Promise<number> {
  const args: Record<string, unknown> = {
    phrase,
    userPrompt: `Count tweets mentioning ${phrase}`,
  };

  if (options.startDate) args.startDate = options.startDate;
  if (options.endDate) args.endDate = options.endDate;

  const result = await callTool('countTweets', args);

  if (typeof result === 'object' && result !== null) {
    const data = result as Record<string, unknown>;
    if (data.operationId) {
      const opResult = await waitForOperation(data.operationId as string);
      const response = opResult as { results?: number };
      return response.results || 0;
    }
    if (typeof data.results === 'number') {
      return data.results;
    }
  }

  return 0;
}

/**
 * Count tweets using search API with OR query support
 * This is slower than countTweets but supports expanded queries like "TSLA OR Tesla OR $TSLA"
 * Returns the totalRows from pagination without fetching all results
 */
export async function countTweetsExpanded(
  query: string,
  options: { startDate?: string; endDate?: string } = {}
): Promise<number> {
  const args: Record<string, unknown> = {
    query,
    userPrompt: `Count tweets matching: ${query}`,
    fields: ['id'], // Minimal fields for speed
  };

  if (options.startDate) args.startDate = options.startDate;
  if (options.endDate) args.endDate = options.endDate;

  const result = await callTool('getTwitterPostsByKeywords', args);

  if (typeof result === 'object' && result !== null) {
    const data = result as Record<string, unknown>;
    if (data.operationId) {
      const opResult = await waitForOperation(data.operationId as string);
      const response = opResult as {
        pagination?: { totalRows: number };
      };
      // Return totalRows from pagination - this is the count we want
      return response.pagination?.totalRows || 0;
    }
    // Direct response with pagination
    const directResponse = data as { pagination?: { totalRows: number } };
    if (directResponse.pagination?.totalRows) {
      return directResponse.pagination.totalRows;
    }
  }

  return 0;
}

/**
 * Get posts by author username
 */
export async function getPostsByAuthor(
  authorUsername: string,
  options: {
    fields?: string[];
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<XpozTwitterPost[]> {
  const args: Record<string, unknown> = {
    authorUsername,
    userPrompt: `Get posts by @${authorUsername}`,
    fields: options.fields || [
      'id', 'text', 'authorUsername', 'createdAtDate',
      'retweetCount', 'replyCount', 'quoteCount'
    ],
  };

  if (options.startDate) args.startDate = options.startDate;
  if (options.endDate) args.endDate = options.endDate;

  const result = await callTool('getTwitterPostsByAuthorUsername', args);

  if (typeof result === 'object' && result !== null) {
    const data = result as Record<string, unknown>;
    if (data.operationId) {
      const opResult = await waitForOperation(data.operationId as string);
      const response = opResult as { results?: XpozTwitterPost[] };
      return response.results || [];
    }
    if (data.results) {
      return (data as { results: XpozTwitterPost[] }).results;
    }
  }

  return [];
}

/**
 * Search for Twitter users
 */
export async function searchTwitterUsers(
  name: string,
  options: { limit?: number; fields?: string[] } = {}
): Promise<unknown[]> {
  const args: Record<string, unknown> = {
    name,
    userPrompt: `Search for Twitter user ${name}`,
    limit: options.limit || 10,
    fields: options.fields || ['id', 'username', 'name', 'followersCount', 'description'],
  };

  const result = await callTool('searchTwitterUsers', args);

  if (typeof result === 'object' && result !== null) {
    const data = result as Record<string, unknown>;
    if (Array.isArray(data)) return data;
    if (data.results && Array.isArray(data.results)) return data.results as unknown[];
  }

  return [];
}

/**
 * Get Twitter user followers
 */
export async function getTwitterFollowers(
  username: string,
  options: { fields?: string[] } = {}
): Promise<unknown[]> {
  const args: Record<string, unknown> = {
    username,
    userPrompt: `Get followers of @${username}`,
    fields: options.fields || ['id', 'username', 'name', 'followersCount'],
  };

  const result = await callTool('getTwitterFollowers', args);

  if (typeof result === 'object' && result !== null) {
    const data = result as Record<string, unknown>;
    if (data.operationId) {
      const opResult = await waitForOperation(data.operationId as string);
      const response = opResult as { results?: unknown[] };
      return response.results || [];
    }
    if (data.results) {
      return data.results as unknown[];
    }
  }

  return [];
}

/**
 * Close the MCP connection
 */
export async function closeConnection(): Promise<void> {
  if (mcpClient) {
    await mcpClient.close();
    mcpClient = null;
    connectionPromise = null;
  }
}

/**
 * Search Twitter posts and get ALL results via CSV export
 * This is better for baseline calculations as it returns the complete dataset
 */
export async function searchTwitterPostsComplete(
  query: string,
  options: {
    fields?: string[];
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<XpozTwitterPost[]> {
  const args: Record<string, unknown> = {
    query,
    userPrompt: `Search for posts about ${query}`,
    fields: options.fields || [
      'id', 'text', 'authorUsername', 'createdAt',
      'retweetCount', 'replyCount'
    ],
  };

  if (options.startDate) args.startDate = options.startDate;
  if (options.endDate) args.endDate = options.endDate;

  const result = await callTool('getTwitterPostsByKeywords', args);

  // Handle async operation and get CSV export ID
  if (typeof result === 'object' && result !== null) {
    const data = result as Record<string, unknown>;
    if (data.operationId) {
      const opResult = await waitForOperation(data.operationId as string);
      const response = opResult as {
        results?: XpozTwitterPost[];
        pagination?: { totalRows: number; totalPages: number };
        dataDumpExportOperationId?: string;
      };

      // If we have a CSV export ID and there are more pages, fetch the CSV
      if (response.dataDumpExportOperationId &&
          response.pagination &&
          response.pagination.totalPages > 1) {
        console.log(`[XPOZ MCP] Fetching complete CSV for ${response.pagination.totalRows} posts...`);

        try {
          // Wait for CSV export to complete
          const csvResult = await waitForOperation(response.dataDumpExportOperationId);
          const csvResponse = csvResult as { signedUrl?: string; totalRows?: number };

          if (csvResponse.signedUrl) {
            console.log(`[XPOZ MCP] Downloading CSV with ${csvResponse.totalRows} rows...`);

            // Download and parse CSV
            const csvData = await fetch(csvResponse.signedUrl);
            const csvText = await csvData.text();

            // Parse CSV
            const posts = parseCSV(csvText, options.fields || ['id', 'text', 'authorUsername', 'createdAtDate', 'retweetCount', 'replyCount']);
            console.log(`[XPOZ MCP] Parsed ${posts.length} posts from CSV`);
            return posts as unknown as XpozTwitterPost[];
          }
        } catch (csvError) {
          console.error(`[XPOZ MCP] CSV export failed, using paginated results:`, csvError);
        }
      }

      // Return first page results if CSV failed or not available
      return response.results || [];
    }
    if (data.results) {
      return (data as { results: XpozTwitterPost[] }).results;
    }
  }

  return [];
}

/**
 * Parse CSV text into array of posts
 * Handles embedded newlines in quoted fields properly
 */
function parseCSV(csvText: string, expectedFields: string[]): Record<string, unknown>[] {
  // Parse all rows properly handling quoted fields with embedded newlines
  const rows = parseCSVRows(csvText);
  if (rows.length < 2) return [];

  // First row is header
  const header = rows[0].map(h => h.trim().replace(/^"|"$/g, ''));
  const fieldIndices: Record<string, number> = {};
  expectedFields.forEach(field => {
    const idx = header.findIndex(h => h.toLowerCase() === field.toLowerCase());
    if (idx >= 0) fieldIndices[field] = idx;
  });

  console.log(`[XPOZ MCP] CSV header fields: ${header.join(', ')}`);
  console.log(`[XPOZ MCP] Mapping fields: ${JSON.stringify(fieldIndices)}`);

  // Parse data rows (skip header)
  const results: Record<string, unknown>[] = [];
  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    const row: Record<string, unknown> = {};

    Object.entries(fieldIndices).forEach(([field, idx]) => {
      if (idx < values.length) {
        let val: unknown = values[idx];
        // Parse numbers for count fields
        if (['retweetCount', 'replyCount', 'quoteCount'].includes(field) && typeof val === 'string') {
          val = parseInt(val, 10) || 0;
        }
        row[field] = val;
      }
    });

    if (Object.keys(row).length > 0) {
      results.push(row);
    }
  }

  return results;
}

/**
 * Parse CSV text into array of rows, each row being array of values
 * Properly handles quoted fields with embedded newlines
 */
function parseCSVRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote inside quoted field
        currentValue += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      currentRow.push(currentValue);
      currentValue = '';
    } else if (char === '\n' && !inQuotes) {
      // End of row (handle \r\n too)
      currentRow.push(currentValue);
      if (currentRow.length > 0 && currentRow.some(v => v.trim())) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentValue = '';
    } else if (char === '\r' && !inQuotes) {
      // Skip carriage return (will be followed by \n)
      continue;
    } else {
      currentValue += char;
    }
  }

  // Handle last row (no trailing newline)
  if (currentValue || currentRow.length > 0) {
    currentRow.push(currentValue);
    if (currentRow.some(v => v.trim())) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

// Export a simple interface for widgets
export const XpozMCP = {
  searchTwitterPosts,
  searchTwitterPostsComplete,
  countTweets,
  countTweetsExpanded,
  getPostsByAuthor,
  searchTwitterUsers,
  getTwitterFollowers,
  closeConnection,
};

export default XpozMCP;
