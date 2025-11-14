import * as fs from 'fs';
import * as path from 'path';
import { TodoItem, FileTodos } from './types';
import * as crypto from 'crypto';

/**
 * 解析 markdown 文件中的 todo 項目
 */
export class MarkdownTodoParser {
  // 匹配 todo 項目的正則表達式
  // 格式: - [ ] 或 - [x] 開頭
  private readonly TODO_REGEX = /^(\s*)-\s\[([ xX])\]\s+(.+)$/;

  // 匹配標籤的正則表達式 (#tag)
  private readonly TAG_REGEX = /#(\w+)/g;

  // 匹配日期的正則表達式 (📅 YYYY-MM-DD)
  private readonly DATE_REGEX = /📅\s*(\d{4}-\d{2}-\d{2})/;

  /**
   * 解析單個 markdown 檔案
   */
  parseFile(filePath: string): FileTodos | null {
    try {
      if (!fs.existsSync(filePath) || !filePath.endsWith('.md')) {
        return null;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const todos: TodoItem[] = [];

      lines.forEach((line, index) => {
        const todo = this.parseLine(line, filePath, index + 1);
        if (todo) {
          todos.push(todo);
        }
      });

      return {
        filePath,
        fileName: path.basename(filePath),
        todos
      };
    } catch (error) {
      console.error(`Error parsing file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * 解析單行文字
   */
  private parseLine(line: string, filePath: string, lineNumber: number): TodoItem | null {
    const match = line.match(this.TODO_REGEX);
    if (!match) {
      return null;
    }

    const [, , checkedMark, content] = match;
    const completed = checkedMark.toLowerCase() === 'x';

    // 提取標籤
    const tags: string[] = [];
    let tagMatch;
    while ((tagMatch = this.TAG_REGEX.exec(content)) !== null) {
      tags.push(tagMatch[1]);
    }

    // 提取日期
    const dateMatch = content.match(this.DATE_REGEX);
    const date = dateMatch ? dateMatch[1] : undefined;

    // 移除標籤和日期後的純文字內容
    let text = content
      .replace(this.TAG_REGEX, '')
      .replace(this.DATE_REGEX, '')
      .replace(/📅/g, '')
      .trim();

    // 生成唯一 ID
    const id = this.generateId(filePath, lineNumber, content);

    return {
      id,
      text,
      completed,
      tags,
      date,
      filePath,
      lineNumber,
      rawLine: line
    };
  }

  /**
   * 掃描資料夾中的所有 markdown 檔案
   */
  scanDirectory(dirPath: string): FileTodos[] {
    const results: FileTodos[] = [];

    try {
      const files = this.getMarkdownFiles(dirPath);

      for (const file of files) {
        const fileTodos = this.parseFile(file);
        if (fileTodos && fileTodos.todos.length > 0) {
          results.push(fileTodos);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
    }

    return results;
  }

  /**
   * 遞迴獲取資料夾中的所有 markdown 檔案
   */
  private getMarkdownFiles(dirPath: string): string[] {
    const files: string[] = [];

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        // 跳過隱藏資料夾和 node_modules
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }

        if (entry.isDirectory()) {
          files.push(...this.getMarkdownFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error);
    }

    return files;
  }

  /**
   * 生成唯一 ID
   */
  private generateId(filePath: string, lineNumber: number, content: string): string {
    const hash = crypto.createHash('md5');
    hash.update(`${filePath}:${lineNumber}:${content}`);
    return hash.digest('hex').substring(0, 12);
  }

  /**
   * 更新 todo 的狀態
   */
  updateTodoStatus(todo: TodoItem, completed: boolean): boolean {
    try {
      const content = fs.readFileSync(todo.filePath, 'utf-8');
      const lines = content.split('\n');

      if (todo.lineNumber > 0 && todo.lineNumber <= lines.length) {
        const line = lines[todo.lineNumber - 1];
        const newLine = completed
          ? line.replace(/- \[ \]/, '- [x]')
          : line.replace(/- \[x\]/i, '- [ ]');

        lines[todo.lineNumber - 1] = newLine;
        fs.writeFileSync(todo.filePath, lines.join('\n'), 'utf-8');
        return true;
      }
    } catch (error) {
      console.error('Error updating todo status:', error);
    }
    return false;
  }

  /**
   * 更新 todo 的文字內容
   */
  updateTodoText(todo: TodoItem, newText: string): boolean {
    try {
      const content = fs.readFileSync(todo.filePath, 'utf-8');
      const lines = content.split('\n');

      if (todo.lineNumber > 0 && todo.lineNumber <= lines.length) {
        const checkbox = todo.completed ? '[x]' : '[ ]';
        const tags = todo.tags.map(tag => `#${tag}`).join(' ');
        const dateStr = todo.date ? `📅 ${todo.date}` : '';

        const newLine = `- ${checkbox} ${newText} ${tags} ${dateStr}`.trim();
        lines[todo.lineNumber - 1] = newLine;

        fs.writeFileSync(todo.filePath, lines.join('\n'), 'utf-8');
        return true;
      }
    } catch (error) {
      console.error('Error updating todo text:', error);
    }
    return false;
  }
}
