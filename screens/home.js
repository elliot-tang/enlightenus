"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var AuthContext_1 = require("../context/AuthContext");
var AuthContext_2 = require("../context/AuthContext");
var HomeScreen = function () {
    var user = (0, AuthContext_1.returnUser)();
    var logout = (0, AuthContext_2.useAuth)().logout;
    var handleLogout = function () {
        logout();
    };
    return (<react_native_1.View style={styles.container}>
    <react_native_1.Text style={styles.headerText}>
      Welcome, {user}!
    </react_native_1.Text>
    <react_native_1.Button title="Logout" onPress={handleLogout}/>
  </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 60,
    }
});
exports.default = HomeScreen;
