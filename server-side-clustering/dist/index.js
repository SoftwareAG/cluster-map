"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = exports.ClusterMap = void 0;
require("supercluster");
var supercluster_1 = __importDefault(require("supercluster"));
var MicroserviceSubscriptionService_1 = require("./microservice/MicroserviceSubscriptionService");
var express_1 = __importDefault(require("express"));
var bodyParser = __importStar(require("body-parser"));
var ClusterMap = /** @class */ (function () {
    function ClusterMap(subsriptionService) {
        var _this = this;
        subsriptionService.on(MicroserviceSubscriptionService_1.MicroserviceSubscriptionService.NEW_MICROSERVICE_SUBSCRIPTION, function (client) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = this;
                        _c = (_b = new supercluster_1.default({
                            log: true,
                            radius: 60,
                            extent: 256,
                            maxZoom: 17
                        })).load;
                        return [4 /*yield*/, this.getJSON(client)];
                    case 1:
                        _a.index = _c.apply(_b, [_d.sent()]);
                        console.log(this.index.getTile(0, 0, 0));
                        return [2 /*return*/];
                }
            });
        }); });
    }
    ClusterMap.prototype.getFilter = function (page) {
        return { pageSize: 100, withTotalPages: true, query: 'has(c8y_Position)', currentPage: page };
    };
    ClusterMap.prototype.getJSON = function (client) {
        return __awaiter(this, void 0, void 0, function () {
            var features, _a, data, res, paging, next, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        features = new Array();
                        console.log("Getting first page of devices...");
                        return [4 /*yield*/, client.inventory.list({ pageSize: 1000, query: 'has(c8y_Position) and has(c8y_IsDevice)' })];
                    case 1:
                        _a = _b.sent(), data = _a.data, res = _a.res, paging = _a.paging;
                        _b.label = 2;
                    case 2:
                        if (!(data.length > 0)) return [3 /*break*/, 7];
                        console.log("Processing page " + paging.currentPage + "...");
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        data.forEach(function (mo) {
                            features.push({ type: "Feature", geometry: { type: "Point", coordinates: [mo.c8y_Position.lng, mo.c8y_Position.lat] }, properties: { name: mo.name } });
                        });
                        console.log("Getting next page...");
                        return [4 /*yield*/, paging.next()];
                    case 4:
                        next = (_b.sent());
                        paging = next.paging;
                        data = next.data;
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _b.sent();
                        console.error(e_1);
                        data = [];
                        return [3 /*break*/, 6];
                    case 6: return [3 /*break*/, 2];
                    case 7:
                        console.log("All pages processed.");
                        return [2 /*return*/, features];
                }
            });
        });
    };
    ClusterMap.prototype.update = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                console.log(data);
                result = {};
                if (data.getClusterExpansionZoom) {
                    result = {
                        expansionZoom: this.index.getClusterExpansionZoom(data.getClusterExpansionZoom),
                        center: data.center
                    };
                }
                else if (data) {
                    result = this.index.getClusters(data.bbox, data.zoom);
                }
                console.log(result);
                return [2 /*return*/, result];
            });
        });
    };
    return ClusterMap;
}());
exports.ClusterMap = ClusterMap;
var App = /** @class */ (function () {
    function App(subscriptionService, clusterMap) {
        var _this = this;
        this.app = express_1.default();
        this.PORT = process.env.PORT || 80;
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.post("/update", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = res).json;
                        return [4 /*yield*/, clusterMap.update(req.body)];
                    case 1:
                        _b.apply(_a, [_c.sent()]);
                        return [2 /*return*/];
                }
            });
        }); });
        this.app.listen(this.PORT, function () { return console.log("Now listening on port " + _this.PORT + "!"); });
    }
    return App;
}());
exports.App = App;
var subscriptionService = new MicroserviceSubscriptionService_1.MicroserviceSubscriptionService();
new App(subscriptionService, new ClusterMap(subscriptionService));
//# sourceMappingURL=index.js.map