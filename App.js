"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var native_1 = require("@react-navigation/native");
var native_stack_1 = require("@react-navigation/native-stack");
var login_1 = __importDefault(require("./screens/login"));
var register_1 = __importDefault(require("./screens/register"));
var home_1 = __importDefault(require("./screens/home"));
var AuthContext_1 = require("./context/AuthContext");
var AuthStackNav = (0, native_stack_1.createNativeStackNavigator)();
var HomeStackNav = (0, native_stack_1.createNativeStackNavigator)();
var AuthStack = function () { return (<AuthStackNav.Navigator> 
    <AuthStackNav.Screen name='Login' component={login_1.default}/>
    <AuthStackNav.Screen name='Register' component={register_1.default}/>
  </AuthStackNav.Navigator>); };
var HomeStack = function () { return (<HomeStackNav.Navigator> 
    <HomeStackNav.Screen name='Home' component={home_1.default}/>
  </HomeStackNav.Navigator>); };
var AuthNavigator = function () {
    var loggedIn = (0, AuthContext_1.useAuth)();
    var user = loggedIn.user;
    return user ? <HomeStack /> : <AuthStack />;
};
var App = function () { return (<AuthContext_1.AuthProvider>
    <native_1.NavigationContainer>
      <AuthNavigator />
    </native_1.NavigationContainer>
  </AuthContext_1.AuthProvider>); };
exports.default = App;
