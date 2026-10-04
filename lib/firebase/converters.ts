import { type DocumentData, type FirestoreDataConverter, type QueryDocumentSnapshot, type SnapshotOptions, type WithFieldValue } from "firebase/firestore";

export function makeConverter<T extends DocumentData>(): FirestoreDataConverter<T> {
  return {
    toFirestore(data: WithFieldValue<T>): DocumentData {
      return data as DocumentData;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T {
      return snapshot.data(options) as T;
    },
  };
}
