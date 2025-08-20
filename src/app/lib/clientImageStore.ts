export type ClientRef = {
  kind: "client";
  id: string;
  name: string;
  type: string;
  size: number;
};

const files = new Map<string, File>();

function uuid() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

export function putClientFile(file: File): ClientRef {
  const id = uuid();
  files.set(id, file);
  return {
    kind: "client",
    id,
    name: file.name,
    type: file.type,
    size: file.size,
  };
}

export function getClientFile(id: string) {
  return files.get(id) ?? null;
}

export function deleteClientFile(id: string) {
  files.delete(id);
}
