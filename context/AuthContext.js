"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
exports.useAuth = exports.returnUser = exports.AuthProvider = void 0;
var react_1 = __importStar(require("react"));
var async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
var axios_1 = __importDefault(require("axios"));
// import api from '../services/api';
var fakeenv_json_1 = __importDefault(require("../fakeenv.json"));
var AuthContext = (0, react_1.createContext)({});
var AuthProvider = function (_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)(undefined), user = _b[0], setUser = _b[1];
    var _c = (0, react_1.useState)(undefined), token = _c[0], setToken = _c[1];
    var _d = (0, react_1.useState)(true), loading = _d[0], setLoading = _d[1];
    // checks for token upon mount
    (0, react_1.useEffect)(function () {
        function loadUser() {
            return __awaiter(this, void 0, void 0, function () {
                var token, user, keepSignedIn;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, async_storage_1.default.getItem('token')];
                        case 1:
                            token = _a.sent();
                            return [4 /*yield*/, async_storage_1.default.getItem('user')];
                        case 2:
                            user = _a.sent();
                            return [4 /*yield*/, async_storage_1.default.getItem('keepSignedIn')];
                        case 3:
                            keepSignedIn = _a.sent();
                            if (token && user && (keepSignedIn === null || keepSignedIn === 'true')) {
                                // TODO: implement decoding of token
                                setToken(token);
                                setUser(user);
                            }
                            else {
                                async_storage_1.default.removeItem('token');
                                async_storage_1.default.removeItem('user');
                                async_storage_1.default.removeItem('keepSignedIn');
                            }
                            setLoading(false);
                            return [2 /*return*/];
                    }
                });
            });
        }
        loadUser();
    }, []);
    var login = function (username, password, keepSignedIn) { return __awaiter(void 0, void 0, void 0, function () {
        var response, _a, token_1, user_1, error_1;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, axios_1.default.post("".concat(fakeenv_json_1.default.BACKEND_API, "/login"), { username: username, password: password })];
                case 1:
                    response = _c.sent();
                    _a = response.data, token_1 = _a.token, user_1 = _a.user;
                    setToken(token_1);
                    setUser(user_1);
                    if (!keepSignedIn) return [3 /*break*/, 3];
                    return [4 /*yield*/, async_storage_1.default.setItem('user', user_1)];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3: return [4 /*yield*/, async_storage_1.default.setItem('token', token_1)];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, async_storage_1.default.setItem('keepSignedIn', String(keepSignedIn))];
                case 5:
                    _c.sent();
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _c.sent();
                    if (axios_1.default.isAxiosError(error_1)) {
                        console.error('Axios error:', error_1.message);
                        console.error('Error response:', (_b = error_1.response) === null || _b === void 0 ? void 0 : _b.data);
                    }
                    else {
                        console.error('Unexpected error:', error_1);
                    }
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var register = function (email, username, password) { return __awaiter(void 0, void 0, void 0, function () {
        var backendAPI, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    backendAPI = "".concat(fakeenv_json_1.default.BACKEND_API, "/register");
                    console.log("".concat(fakeenv_json_1.default.BACKEND_API, "/register"));
                    return [4 /*yield*/, axios_1.default.post("".concat(fakeenv_json_1.default.BACKEND_API, "/register"), { email: email, username: username, password: password })];
                case 1:
                    _b.sent();
                    console.log('User registered!');
                    alert('Registration success!');
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _b.sent();
                    if (axios_1.default.isAxiosError(error_2)) {
                        console.error('Axios error:', error_2.message);
                        console.error('Error response:', (_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data);
                    }
                    else {
                        console.error('Unexpected error:', error_2);
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var logout = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // TODO
            setToken(undefined);
            setUser(undefined);
            setLoading(true);
            return [2 /*return*/];
        });
    }); };
    var value = { user: user, token: token, loading: loading, login: login, register: register, logout: logout };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
exports.AuthProvider = AuthProvider;
var returnUser = function () {
    var data = (0, react_1.useContext)(AuthContext);
    if (data.user) {
        return data.user;
    }
    else {
        throw new Error('returnUser must be used within an AuthContext');
    }
};
exports.returnUser = returnUser;
var useAuth = function () { return (0, react_1.useContext)(AuthContext); };
exports.useAuth = useAuth;
