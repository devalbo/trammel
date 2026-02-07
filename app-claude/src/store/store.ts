import { createStore } from 'tinybase';
import { createLocalPersister } from 'tinybase/persisters/persister-browser';

export function createTrammelStore() {
  return createStore();
}

export function createTrammelPersister(store: ReturnType<typeof createStore>) {
  return createLocalPersister(store, 'trammel-claude');
}
