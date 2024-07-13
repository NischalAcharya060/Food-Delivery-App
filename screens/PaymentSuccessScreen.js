import React from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PaymentSuccessScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/img/success.png')}
                style={styles.successImage}
                resizeMode="contain"
            />
            <Text style={styles.title}>Payment Successful!</Text>
            <Text style={styles.subtitle}>Thank you for your purchase.</Text>
            <View style={styles.buttonContainer}>
                <Button title="Go to Home" onPress={() => navigation.navigate('Home')} />
                <Button
                    title="View Order History"
                    onPress={() => navigation.navigate('OrderHistory')}
                    color="#6200EE"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    successImage: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#6200EE',
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    buttonContainer: {
        width: '100%',
        marginTop: 20,
    },
});

export default PaymentSuccessScreen;
