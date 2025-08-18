import { EventEmitter } from 'events';

// 全局进度事件管理器
const docIdToEmitter: Map<string, EventEmitter> = new Map();

export function getProgressEmitter(docId: string): EventEmitter {
  let emitter = docIdToEmitter.get(docId);
  if (!emitter) {
    emitter = new EventEmitter();
    // 增加监听器上限，避免并发时的警告
    emitter.setMaxListeners(50);
    docIdToEmitter.set(docId, emitter);
  }
  return emitter;
}

export function removeProgressEmitter(docId: string): void {
  const emitter = docIdToEmitter.get(docId);
  if (emitter) {
    emitter.removeAllListeners();
    docIdToEmitter.delete(docId);
  }
}

export function emitProgress(docId: string, payload: Record<string, unknown>): void {
  const emitter = getProgressEmitter(docId);
  emitter.emit('progress', { docId, ...payload });
}


