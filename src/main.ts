// 首先导入polyfill以确保兼容性
import './polyfills/attributeStyleMap';
import { LoadingManager } from './controllers/loading';
// import { ScrollManager } from './scroll';
import { CloudManager } from './controllers/cloud';

LoadingManager.getInstance().init();
CloudManager.getInstance().init();
// ScrollManager.getInstance().init();

