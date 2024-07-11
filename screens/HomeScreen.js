import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const dummyFoodImage = require('../assets/img/food.png');

const HomeScreen = ({ navigation }) => {
    const [foods, setFoods] = useState([]);

    const firestore = getFirestore();

    useEffect(() => {
        const fetchFoods = async () => {
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
            }
        };

        fetchFoods();
    }, []);

    const handleBuyFood = (food) => {
        Alert.alert('Success', `You have bought ${food.name} for ${food.price}`);
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
        <TouchableOpacity style={styles.foodItem} onPress={() => handleBuyFood(item)}>
            <Image
                source={item.image ? { uri: item.image } : dummyFoodImage}
                style={styles.foodImage}
                resizeMode="cover"
            />
            <View style={styles.foodDetails}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodPrice}>${item.price}</Text>
                <Text style={styles.foodDescription}>{item.description}</Text>
                <View style={styles.buyButtonContainer}>
                    <Text style={styles.buyButtonText}>Buy</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Main Content */}
            <View style={styles.content}>
                {foods.map((item) => (
                    <View key={item.id} style={styles.foodItemWrapper}>
                        <TouchableOpacity style={styles.foodItem} onPress={() => handleBuyFood(item)}>
                            <Image
                                source={item.image ? { uri: item.image } : dummyFoodImage}
                                style={styles.foodImage}
                                resizeMode="cover"
                            />
                            <View style={styles.foodDetails}>
                                <Text style={styles.foodName}>{item.name}</Text>
                                <Text style={styles.foodPrice}>${item.price}</Text>
                                <Text style={styles.foodDescription}>{item.description}</Text>
                                <View style={styles.buyButtonContainer}>
                                    <Text style={styles.buyButtonText}>Buy</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            {/* Footer Navbar */}
            <View style={styles.footerNavbar}>
                <TouchableOpacity style={styles.navbarIcon}>
                    <Icon name="home-outline" size={30} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navbarIcon} onPress={navigateToRestaurant}>
                    <Icon name="restaurant-outline" size={30} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navbarIcon} onPress={navigateToAddFood}>
                    <Icon name="add-circle-outline" size={30} color="#333" />
                </TouchableOpacity>
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
        position: 'relative',
    },
    content: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
    },
    foodItemWrapper: {
        width: '50%',
        padding: 5,
    },
    foodItem: {
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    foodImage: {
        width: '100%',
        height: 150,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    foodDetails: {
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
    buyButtonContainer: {
        backgroundColor: '#6200EE',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginTop: 10,
    },
    buyButtonText: {
        color: '#fff',
        fontSize: 16,
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
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    navbarIcon: {
        padding: 10,
    },
});

export default HomeScreen;
