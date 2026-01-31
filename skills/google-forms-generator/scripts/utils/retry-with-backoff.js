/**
 * 指数バックオフリトライユーティリティ
 *
 * Google API の 429 (レート制限) エラー時に自動リトライを行う
 *
 * 使用方法:
 *   const { retryWithBackoff } = require('./scripts/utils/retry-with-backoff');
 *   const result = await retryWithBackoff(async () => {
 *     return await api.someMethod();
 *   });
 */

/**
 * 指数バックオフでリトライを実行
 * @param {Function} fn 実行する非同期関数
 * @param {number} maxRetries 最大リトライ回数（デフォルト: 3）
 * @param {number} baseDelay 基本遅延時間（ミリ秒、デフォルト: 1000）
 * @param {Object} options オプション
 * @returns {Promise<any>} 関数の実行結果
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000, options = {}) {
  const {
    maxDelay = 64000,        // 最大遅延時間（64秒）
    retryableCodes = [429, 500, 502, 503, 504],  // リトライ対象のHTTPステータスコード
    onRetry = null,          // リトライ時のコールバック
    jitterFactor = 1.0       // ジッター係数（0〜1）
  } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const statusCode = error.code || error.response?.status;

      // リトライ対象外のエラー、または最後の試行
      if (!retryableCodes.includes(statusCode) || attempt === maxRetries) {
        throw error;
      }

      // 指数バックオフ + ランダムジッター
      // wait_time = min((2^n * baseDelay) + random_ms, maxDelay)
      const exponentialDelay = Math.pow(2, attempt) * baseDelay;
      const jitter = Math.random() * baseDelay * jitterFactor;
      const delay = Math.min(exponentialDelay + jitter, maxDelay);

      const retryInfo = {
        attempt: attempt + 1,
        maxRetries,
        delay: Math.round(delay),
        error: error.message,
        statusCode
      };

      // コールバック呼び出し
      if (onRetry) {
        onRetry(retryInfo);
      } else {
        console.log(`リトライ ${attempt + 1}/${maxRetries}: ${Math.round(delay)}ms 待機 (${error.message})`);
      }

      // 待機
      await sleep(delay);
    }
  }
}

/**
 * スリープ関数
 * @param {number} ms ミリ秒
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * リトライ付きバッチ処理
 * 複数のリクエストを順次実行し、各リクエストでリトライを行う
 * @param {Array<Function>} tasks 実行する非同期関数の配列
 * @param {number} concurrency 同時実行数（デフォルト: 1）
 * @param {Object} options リトライオプション
 * @returns {Promise<Array>} 結果の配列
 */
async function batchWithRetry(tasks, concurrency = 1, options = {}) {
  const results = [];
  const errors = [];

  // シーケンシャル実行（concurrency = 1）
  if (concurrency === 1) {
    for (let i = 0; i < tasks.length; i++) {
      try {
        const result = await retryWithBackoff(tasks[i], options.maxRetries, options.baseDelay, options);
        results.push({ index: i, success: true, data: result });
      } catch (error) {
        errors.push({ index: i, success: false, error: error.message });
        results.push({ index: i, success: false, error: error.message });
      }
    }
  } else {
    // 並列実行（concurrency > 1）
    const chunks = [];
    for (let i = 0; i < tasks.length; i += concurrency) {
      chunks.push(tasks.slice(i, i + concurrency));
    }

    for (const chunk of chunks) {
      const chunkResults = await Promise.allSettled(
        chunk.map((task, idx) => retryWithBackoff(task, options.maxRetries, options.baseDelay, options))
      );

      chunkResults.forEach((result, idx) => {
        const index = results.length;
        if (result.status === 'fulfilled') {
          results.push({ index, success: true, data: result.value });
        } else {
          errors.push({ index, success: false, error: result.reason?.message });
          results.push({ index, success: false, error: result.reason?.message });
        }
      });
    }
  }

  return {
    results,
    errors,
    successCount: results.filter(r => r.success).length,
    errorCount: errors.length
  };
}

module.exports = {
  retryWithBackoff,
  batchWithRetry,
  sleep
};
