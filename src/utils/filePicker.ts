


async function showSaveFilePicker(props: {
  suggestedName?: string;
  types?: {
    description: string;
    accept: Record<string, string[]>;
  }[];
  generator: () => Promise<ArrayBuffer | DataView | Blob | string | null>;
}) {
  const { suggestedName, types, generator } = props;
  const fileHandle = await (window as any).showSaveFilePicker({
    suggestedName,
    types,
  });

  const data = await generator();
  const writable = await fileHandle.createWritable();
  await writable.write(data);
  await writable.close();
}

export {showSaveFilePicker}