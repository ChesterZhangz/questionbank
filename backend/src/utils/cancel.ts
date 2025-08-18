const cancelledDocs = new Set<string>();

export function markCancelled(docId: string): void {
  cancelledDocs.add(docId);
}

export function isCancelled(docId?: string): boolean {
  if (!docId) return false;
  return cancelledDocs.has(docId);
}

export function clearCancelled(docId: string): void {
  cancelledDocs.delete(docId);
}


