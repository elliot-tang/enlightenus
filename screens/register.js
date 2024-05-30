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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var AuthContext_1 = require("../context/AuthContext");
var RegisterScreen = function (_a) {
    var navigation = _a.navigation;
    var _b = (0, react_1.useState)(''), email = _b[0], setEmail = _b[1];
    var _c = (0, react_1.useState)(''), username = _c[0], setUsername = _c[1];
    var _d = (0, react_1.useState)(''), password = _d[0], setPassword = _d[1];
    var _e = (0, react_1.useState)(''), confirmPassword = _e[0], setConfirmPassword = _e[1];
    var register = (0, AuthContext_1.useAuth)().register;
    var handleRegister = function () {
        if (password != confirmPassword) {
            alert("Passwords don't match");
        }
        register(email, username, password);
    };
    return (<react_native_1.View>
      <react_native_1.TextInput placeholder="Email" value={email} onChangeText={setEmail}/>
      <react_native_1.TextInput placeholder="Username" value={username} onChangeText={setUsername}/>
      <react_native_1.TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry/>
      <react_native_1.TextInput placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry/>
      <react_native_1.Button title="Register" onPress={handleRegister}/>
      <react_native_1.Text onPress={function () { return navigation.navigate('Login'); }}>Back to login</react_native_1.Text>
    </react_native_1.View>);
};
exports.default = RegisterScreen;
