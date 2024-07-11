import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import Icon from "react-native-vector-icons/Ionicons";

const dummyFoodImage = require('../assets/img/food.png');
const dummyProfileImage = require('../assets/img/profile.jpg');

const HomeScreen = ({ navigation }) => {
    const [foods, setFoods] = useState([]);
    const [profileImage, setProfileImage] = useState(dummyProfileImage);
    const [loading, setLoading] = useState(true);
    const [sortByPriceAsc, setSortByPriceAsc] = useState(false);
    const [sortByPriceDesc, setSortByPriceDesc] = useState(false);

    const firestore = getFirestore();

    // Function to fetch foods
    const fetchFoods = async () => {
        setLoading(true);
        try {
            let foodCollection = collection(firestore, 'foods');

            // Apply sorting
            if (sortByPriceAsc) {
                foodCollection = query(foodCollection, orderBy('price', 'asc'));
            } else if (sortByPriceDesc) {
                foodCollection = query(foodCollection, orderBy('price', 'desc'));
            }

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

    // Fetch foods on initial load and when dependencies change
    useFocusEffect(
        React.useCallback(() => {
            fetchFoods();
        }, [firestore, sortByPriceAsc, sortByPriceDesc])
    );

    // Navigate to food detail screen
    const handleBuyFood = (food) => {
        navigation.navigate('FoodDetail', { food });
    };

    // Navigate to profile screen
    const navigateToProfile = () => {
        navigation.navigate('Profile');
    };

    // Navigate to restaurant screen
    const navigateToRestaurant = () => {
        navigation.navigate('Restaurant');
    };

    // Navigate to add food screen
    const navigateToAddFood = () => {
        navigation.navigate('AddFood');
    };

    // Render each food item
    const renderFoodItem = ({ item }) => (
        <TouchableOpacity style={styles.foodCard} onPress={() => handleBuyFood(item)}>
            <Image
                source={item.image ? { uri: item.image } : dummyFoodImage}
                style={styles.foodImage}
                resizeMode="cover"
            />
            <View style={styles.foodCardContent}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodPrice}>Rs. {item.price}</Text>
                <TouchableOpacity style={styles.buyButton} onPress={() => handleBuyFood(item)}>
                    <Text style={styles.buyButtonText}>Buy</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Sorting Buttons */}
            <View style={styles.sortButtons}>
                <TouchableOpacity
                    style={[styles.sortButton, sortByPriceAsc && styles.activeSortButton]}
                    onPress={() => {
                        setSortByPriceAsc(true);
                        setSortByPriceDesc(false);
                        fetchFoods();
                    }}
                >
                    <Text style={[styles.sortButtonText, sortByPriceAsc && styles.activeSortButtonText]}>Low to High</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.sortButton, sortByPriceDesc && styles.activeSortButton]}
                    onPress={() => {
                        setSortByPriceAsc(false);
                        setSortByPriceDesc(true);
                        fetchFoods();
                    }}
                >
                    <Text style={[styles.sortButtonText, sortByPriceDesc && styles.activeSortButtonText]}>High to Low</Text>
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6200EE" />
                </View>
            ) : foods.length > 0 ? (
                <FlatList
                    data={foods}
                    renderItem={renderFoodItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.content}
                    numColumns={2}
                />
            ) : (
                <Text style={styles.emptyText}>No foods found</Text>
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
        paddingHorizontal: 10,
        paddingBottom: 60,
        position: 'relative',
    },
    sortButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    sortButton: {
        flex: 1,
        backgroundColor: '#eee',
        paddingVertical: 12,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
    },
    activeSortButton: {
        backgroundColor: '#6200EE',
    },
    sortButtonText: {
        color: '#333',
        fontSize: 16,
    },
    activeSortButtonText: {
        color: '#ffffff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 5,
    },
    foodCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        margin: 8,
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
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#333',
    },
    foodPrice: {
        fontSize: 14,
        color: '#6200EE',
        marginBottom: 4,
    },
    buyButton: {
        backgroundColor: '#6200EE',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 4,
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    buyButtonText: {
        color: '#fff',
        fontSize: 14,
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
