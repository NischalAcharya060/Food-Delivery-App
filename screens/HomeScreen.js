import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import LogoImage from '../assets/icon.png';

const HomeScreen = ({ navigation, route }) => {
    const reloadApp = () => {
        navigation.replace('Home');
    };
    const navigateToProfile = () => {
        navigation.navigate('Profile');
    };

    return (
        <View style={styles.container}>
            {/* Navbar */}
            <View style={styles.navbar}>
                <TouchableOpacity style={styles.navbarIcon}>
                    <Icon name="menu-outline" size={30} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity onPress={reloadApp}>
                    <Image source={LogoImage} style={styles.logo} resizeMode="contain" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navbarIcon} onPress={navigateToProfile}>
                    <Icon name="person-circle-outline" size={30} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.content}>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    navbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        backgroundColor: '#fff',
    },
    navbarIcon: {
        padding: 10,
    },
    logo: {
        width: 120,
        height: 60,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    welcomeText: {
        fontSize: 28,
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    emailText: {
        fontSize: 16,
        marginBottom: 10,
        color: '#555',
    },
    buttonContainer: {
        width: '100%',
        marginTop: 30,
    },
    button: {
        width: '80%',
        height: 50,
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 15,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
});

export default HomeScreen;
