import { getDatabase, ref, onValue, off } from 'firebase/database';
import { convertDatabaseListToClientFormat } from '@/_utils/database';

let columnInterceptorRef = null;

export const createColumnInterceptor = (url, handler) => {
  const db = getDatabase();
  let init = false;

  if (columnInterceptorRef) {
    off(columnInterceptorRef, 'value');
  }
  columnInterceptorRef = ref(db, url);

  onValue(columnInterceptorRef, async (snapshot) => {
    if (init) {
      const data = await snapshot.val();
      handler(convertDatabaseListToClientFormat(data, ['cards']));
    } else {
      init = true;
    }
  });

  return columnInterceptorRef;
};
