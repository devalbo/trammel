import { createStore } from 'tinybase';
import { createLocalPersister } from 'tinybase/persisters/persister-browser';

export type TrammelFile = {
  name: string;
  content: string;
};

export function createTrammelStore() {
  return createStore();
}

export function createTrammelPersister(store: ReturnType<typeof createStore>) {
  return createLocalPersister(store, 'trammel-codex');
}
