/**
 * Todo 項目的資料結構
 */
export interface TodoItem {
  id: string;              // 唯一識別碼
  text: string;            // todo 內容
  completed: boolean;      // 是否完成
  tags: string[];          // 標籤列表 (如 #td)
  date?: string;           // 日期 (YYYY-MM-DD)
  filePath: string;        // 來源檔案路徑
  lineNumber: number;      // 在檔案中的行號
  rawLine: string;         // 原始 markdown 行
}

/**
 * 檔案中的 todos 集合
 */
export interface FileTodos {
  filePath: string;
  fileName: string;
  todos: TodoItem[];
}
