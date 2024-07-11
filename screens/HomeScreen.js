import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import LogoImage from '../assets/icon.png';

const HomeScreen = ({ navigation, route }) => {
    const role = route?.params?.role || 'user';

    const reloadApp = () => {
        navigation.replace('Home');
    };
    const navigateToProfile = () => {
        navigation.navigate('Profile');
    };
    const navigateToRestaurant = () => {
        navigation.navigate('Restaurant');
    };
    const navigateToAddFood = () => {
        navigation.navigate('AddFood');
    };

    return (
        <View style={styles.container}>
            {/* Main Content */}
            <View style={styles.content}>

            </View>

            {/* Footer Navbar */}
            <View style={styles.footerNavbar}>
                <TouchableOpacity style={styles.navbarIcon}>
                    <Icon name="home-outline" size={30} color="#333" />
                </TouchableOpacity>
                    <>
                        <TouchableOpacity style={styles.navbarIcon} onPress={navigateToRestaurant}>
                            <Icon name="restaurant-outline" size={30} color="#333" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navbarIcon} onPress={navigateToAddFood}>
                            <Icon name="add-circle-outline" size={30} color="#333" />
                        </TouchableOpacity>
                    </>
                <TouchableOpacity style={styles.navbarIcon} onPress={navigateToProfile}>
                    <Icon name="person-circle-outline" size={30} color="#333" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
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
    footerNavbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        backgroundColor: '#fff',
    },
    navbarIcon: {
        padding: 10,
    },
    logo: {
        width: 60,
        height: 30,
    },
});

export default HomeScreen;
