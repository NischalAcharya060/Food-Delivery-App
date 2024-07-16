import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import AppNavigator from './navigation/AppNavigator';
import NetworkStatus from './components/NetworkStatus';

const App = () => {
    return (
        <StripeProvider publishableKey="pk_test_51MlaZ8HNqasSknns9tVkxtdn7agAcnziMWl0I5sycouAc2KkMSSWcCY7DQj5eADIuPu3IWlncxw3uiuZkTfNYgDu00QLo7atiz">
            <NavigationContainer>
                <NetworkStatus />
                <AppNavigator />
            </NavigationContainer>
        </StripeProvider>
    );
};

export default App;