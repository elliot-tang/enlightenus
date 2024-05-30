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
var LoginScreen = function (_a) {
    var navigation = _a.navigation;
    var _b = (0, react_1.useState)(''), username = _b[0], setUsername = _b[1];
    var _c = (0, react_1.useState)(''), password = _c[0], setPassword = _c[1];
    var _d = (0, react_1.useState)(false), keepSignedIn = _d[0], setKeepSignedIn = _d[1];
    var login = (0, AuthContext_1.useAuth)().login;
    var handleLogin = function () {
        login(username, password, keepSignedIn);
    };
    return (<react_native_1.View>
      <react_native_1.TextInput placeholder="Username" value={username} onChangeText={setUsername}/>
      <react_native_1.TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry/>
      <react_native_1.View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <react_native_1.Switch value={keepSignedIn} onValueChange={setKeepSignedIn}/>
        <react_native_1.Text>Keep me signed in</react_native_1.Text>
      </react_native_1.View>
      <react_native_1.Button title="Login" onPress={handleLogin}/>
      <react_native_1.View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <react_native_1.Text>Don't have an account? </react_native_1.Text>
        <react_native_1.Text style={styles.link} onPress={function () { return navigation.navigate('Register'); }}>Register here!</react_native_1.Text>
      </react_native_1.View>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    link: {
        color: "blue",
    }
});
exports.default = LoginScreen;
