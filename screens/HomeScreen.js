import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import Icon from "react-native-vector-icons/Ionicons";

const dummyFoodImage = require('../assets/img/food.png');
const dummyProfileImage = require('../assets/img/profile.jpg');

const HomeScreen = ({ navigation }) => {
    const [foods, setFoods] = useState([]);
    const [profileImage, setProfileImage] = useState(dummyProfileImage);
    const [loading, setLoading] = useState(true);

    const firestore = getFirestore();

    useFocusEffect(
        React.useCallback(() => {
            const fetchFoods = async () => {
                setLoading(true);
                try {
                    const foodCollection = collection(firestore, 'foods');
                    const foodSnapshot = await getDocs(foodCollection);
                    const foodList = foodSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setFoods(foodList);
                } catch (error) {
                    console.error('Error fetching foods:', error.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchFoods();

            return () => {
            };
        }, [firestore])
    );

    const handleBuyFood = (food) => {
        navigation.navigate('FoodDetail', { food });
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

    const renderFoodItem = ({ item }) => (
        <TouchableOpacity style={styles.foodCard} onPress={() => handleBuyFood(item)}>
            <Image
                source={item.image ? { uri: item.image } : dummyFoodImage}
                style={styles.foodImage}
                resizeMode="cover"
            />
            <View style={styles.foodCardContent}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodPrice}>${item.price}</Text>
                <Text style={styles.foodDescription}>{item.description}</Text>
                <TouchableOpacity style={styles.buyButton} onPress={() => handleBuyFood(item)}>
                    <Text style={styles.buyButtonText}>Buy</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Main Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6200EE" />
                </View>
            ) : (
                <View style={styles.content}>
                    {foods.length === 0 ? (
                        <Text style={styles.emptyText}>No food items available</Text>
                    ) : (
                        foods.map(item => (
                            <View key={item.id} style={styles.foodItemWrapper}>
                                {renderFoodItem({ item })}
                            </View>
                        ))
                    )}
                </View>
            )}

            {/* Footer Navbar */}
            <View style={styles.footerNavbar}>
                <TouchableOpacity style={styles.navbarIcon} onPress={() => navigation.navigate('Home', {}, { forceRefresh: true })}>
                    <Icon name="home-outline" size={30} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navbarIcon} onPress={navigateToRestaurant}>
                    <Icon name="restaurant-outline" size={30} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navbarIcon} onPress={navigateToAddFood}>
                    <Icon name="add-circle-outline" size={30} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.profileIcon} onPress={navigateToProfile}>
                    <Image source={profileImage} style={styles.profileImage} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        position: 'relative',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
    },
    foodItemWrapper: {
        width: '50%',
        padding: 10,
    },
    foodCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 20,
    },
    foodImage: {
        width: '100%',
        height: 150,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    foodCardContent: {
        padding: 10,
    },
    foodName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    foodPrice: {
        fontSize: 16,
        color: '#6200EE',
        marginBottom: 5,
    },
    foodDescription: {
        fontSize: 14,
        color: '#555',
        marginBottom: 10,
    },
    buyButton: {
        backgroundColor: '#6200EE',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    buyButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    emptyText: {
        alignSelf: 'center',
        marginTop: 50,
        fontSize: 18,
        color: '#6200EE',
    },
    footerNavbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    navbarIcon: {
        padding: 10,
    },
    profileIcon: {
        padding: 10,
    },
    profileImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
});

export default HomeScreen;
