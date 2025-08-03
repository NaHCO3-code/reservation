import { CloudManager } from "./controllers/cloud";
import { FriendsManager } from "./controllers/friends";
import { LoadingManager } from "./controllers/loading";
import { WordsManager } from "./controllers/words";
import "./polyfills/attributeStyleMap";

LoadingManager.instance.init();
CloudManager.instance.init();
WordsManager.instance.init();
FriendsManager.instance.init();
