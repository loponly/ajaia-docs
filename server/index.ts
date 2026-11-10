import { createApp } from "./app.js";
import { seed } from "./seed.js";
import { FileStore } from "./store/fileStore.js";
import type { Store } from "./store/types.js";

const store: Store =
  process.env.STORE === "firestore"
    ? new (await import("./store/firestoreStore.js")).FirestoreStore()
    : new FileStore();

await seed(store);
const port = Number(process.env.PORT ?? 8080);
createApp(store).listen(port, () => console.log(`Ajaia Docs listening on :${port}`));
