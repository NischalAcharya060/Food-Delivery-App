// navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SignIn from '../components/SignIn';
import SignUp from '../components/SignUp';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from "../screens/ProfileScreen";


const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="SignIn">
            <Stack.Screen name="Login" component={SignIn} />
            <Stack.Screen name="Register" component={SignUp} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
    );
};

export default AppNavigator;
