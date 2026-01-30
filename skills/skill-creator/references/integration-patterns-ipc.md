# Electron IPC 統合パターン

> **読み込み条件**: Electron IPC設計時
> **相対パス**: `references/integration-patterns-ipc.md`
> **親インデックス**: [integration-patterns.md](integration-patterns.md)

---

## 概要

Main Process（Node.js）とRenderer Process（Chromium）間の通信パターン。
セキュリティとパフォーマンスの両立が重要。

## 契約定義（TypeScript）

```typescript
// shared/types/ipc-contracts.ts

/**
 * IPCチャンネル定義（Single Source of Truth）
 */
export const IPC_CHANNELS = {
  // Agent関連
  AGENT_QUERY: "agent:query",
  AGENT_ABORT: "agent:abort",
  AGENT_STREAM: "agent:stream",

  // ファイル操作
  FILE_READ: "file:read",
  FILE_WRITE: "file:write",
  FILE_SELECT: "file:select-dialog",

  // システム
  SYSTEM_INFO: "system:info",
  SYSTEM_NOTIFICATION: "system:notification",
} as const;

export type IPCChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

/**
 * リクエスト/レスポンス型定義
 */
export interface IPCRequest<T = unknown> {
  channel: IPCChannel;
  payload: T;
  requestId: string;
  timestamp: number;
}

export interface IPCResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: IPCError;
  requestId: string;
  duration: number;
}

export interface IPCError {
  code: string;
  message: string;
  stack?: string;
}

/**
 * チャンネル別ペイロード型マッピング
 */
export interface IPCPayloadMap {
  [IPC_CHANNELS.AGENT_QUERY]: {
    request: { prompt: string; options?: AgentOptions };
    response: { result: string; usage: TokenUsage };
  };
  [IPC_CHANNELS.FILE_READ]: {
    request: { path: string; encoding?: BufferEncoding };
    response: { content: string; stats: FileStats };
  };
  [IPC_CHANNELS.FILE_SELECT]: {
    request: { filters?: FileFilter[]; multiSelect?: boolean };
    response: { paths: string[] };
  };
}

/**
 * 型安全なIPCハンドラー型
 */
export type IPCHandler<C extends IPCChannel> = C extends keyof IPCPayloadMap
  ? (
      payload: IPCPayloadMap[C]["request"],
    ) => Promise<IPCPayloadMap[C]["response"]>
  : never;
```

## Main Process実装パターン

```typescript
// main/ipc/handlers.ts
import { ipcMain, BrowserWindow } from "electron";
import {
  IPC_CHANNELS,
  IPCPayloadMap,
  IPCResponse,
} from "@shared/types/ipc-contracts";

/**
 * 型安全なハンドラー登録
 */
function registerHandler<C extends keyof IPCPayloadMap>(
  channel: C,
  handler: (
    payload: IPCPayloadMap[C]["request"],
  ) => Promise<IPCPayloadMap[C]["response"]>,
): void {
  ipcMain.handle(
    channel,
    async (
      event,
      payload,
    ): Promise<IPCResponse<IPCPayloadMap[C]["response"]>> => {
      const startTime = Date.now();
      const requestId = payload.requestId || crypto.randomUUID();

      try {
        // 入力検証
        validatePayload(channel, payload);

        const data = await handler(payload);

        return {
          success: true,
          data,
          requestId,
          duration: Date.now() - startTime,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: error.code || "UNKNOWN_ERROR",
            message: error.message,
            stack:
              process.env.NODE_ENV === "development" ? error.stack : undefined,
          },
          requestId,
          duration: Date.now() - startTime,
        };
      }
    },
  );
}

/**
 * ストリーミング用パターン（Agent応答など）
 */
function registerStreamHandler(
  channel: string,
  handler: (
    payload: unknown,
    send: (chunk: unknown) => void,
    signal: AbortSignal,
  ) => Promise<void>,
): void {
  const abortControllers = new Map<string, AbortController>();

  ipcMain.handle(channel, async (event, payload) => {
    const requestId = payload.requestId || crypto.randomUUID();
    const controller = new AbortController();
    abortControllers.set(requestId, controller);

    const sender = event.sender;
    const streamChannel = `${channel}:stream:${requestId}`;

    try {
      await handler(
        payload,
        (chunk) => {
          if (!sender.isDestroyed()) {
            sender.send(streamChannel, { type: "chunk", data: chunk });
          }
        },
        controller.signal,
      );

      if (!sender.isDestroyed()) {
        sender.send(streamChannel, { type: "end" });
      }
    } catch (error) {
      if (!sender.isDestroyed()) {
        sender.send(streamChannel, { type: "error", error: error.message });
      }
    } finally {
      abortControllers.delete(requestId);
    }
  });

  // 中断ハンドラー
  ipcMain.on(`${channel}:abort`, (event, { requestId }) => {
    const controller = abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      abortControllers.delete(requestId);
    }
  });
}
```

## Preload Script（contextBridge）

```typescript
// preload/index.ts
import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS, IPCPayloadMap } from "@shared/types/ipc-contracts";

/**
 * 型安全なAPI公開
 */
const electronAPI = {
  /**
   * 単発リクエスト
   */
  invoke: async <C extends keyof IPCPayloadMap>(
    channel: C,
    payload: IPCPayloadMap[C]["request"],
  ): Promise<IPCPayloadMap[C]["response"]> => {
    const response = await ipcRenderer.invoke(channel, {
      ...payload,
      requestId: crypto.randomUUID(),
      timestamp: Date.now(),
    });

    if (!response.success) {
      throw new Error(response.error?.message || "IPC Error");
    }

    return response.data;
  },

  /**
   * ストリーミング購読
   */
  stream: <T>(
    channel: string,
    payload: unknown,
    callbacks: {
      onChunk: (chunk: T) => void;
      onEnd: () => void;
      onError: (error: Error) => void;
    },
  ): { abort: () => void } => {
    const requestId = crypto.randomUUID();
    const streamChannel = `${channel}:stream:${requestId}`;

    const handler = (
      _event: unknown,
      message: { type: string; data?: T; error?: string },
    ) => {
      switch (message.type) {
        case "chunk":
          callbacks.onChunk(message.data!);
          break;
        case "end":
          callbacks.onEnd();
          cleanup();
          break;
        case "error":
          callbacks.onError(new Error(message.error));
          cleanup();
          break;
      }
    };

    const cleanup = () => {
      ipcRenderer.removeListener(streamChannel, handler);
    };

    ipcRenderer.on(streamChannel, handler);
    ipcRenderer.invoke(channel, { ...payload, requestId });

    return {
      abort: () => {
        ipcRenderer.send(`${channel}:abort`, { requestId });
        cleanup();
      },
    };
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

// 型定義をRenderer側に公開
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}
```

## 検証チェックリスト

```markdown
## Electron IPC 検証チェックリスト

### 契約定義

- [ ] 全チャンネル名が `IPC_CHANNELS` に集約されている
- [ ] リクエスト/レスポンス型が `IPCPayloadMap` で定義されている
- [ ] 型定義がMain/Preload/Rendererで共有されている

### セキュリティ

- [ ] `nodeIntegration: false` が設定されている
- [ ] `contextIsolation: true` が設定されている
- [ ] `sandbox: true` が設定されている（推奨）
- [ ] contextBridge経由でのみAPIを公開している
- [ ] 入力バリデーションがMain側で実装されている
- [ ] ファイルパスのサニタイズが実装されている

### エラーハンドリング

- [ ] 統一されたエラー形式（IPCError）を使用している
- [ ] 開発環境でのみスタックトレースを返している
- [ ] タイムアウト処理が実装されている
- [ ] 中断（abort）処理が実装されている

### パフォーマンス

- [ ] 大きなデータはストリーミングで送信している
- [ ] 不要なシリアライズを避けている
- [ ] リスナーのクリーンアップが実装されている
```

---

## 関連リソース

- **パターン選択**: See [integration-patterns.md](integration-patterns.md)
- **API実装詳細**: See [api-integration-patterns.md](api-integration-patterns.md)
