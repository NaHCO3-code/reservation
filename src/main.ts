import './polyfills/attributeStyleMap';
import { LoadingManager } from './controllers/loading';
import { CloudManager } from './controllers/cloud';
import { WordsManager } from './controllers/words';

LoadingManager.instance.init();
WordsManager.instance.init();
// CloudManager.instance.init();
