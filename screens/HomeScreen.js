import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, FlatList, Modal, SafeAreaView } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { Searchbar, Button, Checkbox } from 'react-native-paper';
import Icon from "react-native-vector-icons/Ionicons";

const dummyFoodImage = require('../assets/img/food.jpg');
const dummyProfileImage = require('../assets/img/profile.jpg');

const HomeScreen = ({ navigation }) => {
    const [foods, setFoods] = useState([]);
    const [profileImage] = useState(dummyProfileImage);
    const [loading, setLoading] = useState(true);
    const [sortByPriceAsc, setSortByPriceAsc] = useState(false);
    const [sortByPriceDesc, setSortByPriceDesc] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredFoods, setFilteredFoods] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);

    const firestore = getFirestore();

    const fetchFoods = async () => {
        setLoading(true);
        try {
            let foodCollection = collection(firestore, 'foods');
            const foodSnapshot = await getDocs(foodCollection);
            const foodList = foodSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setFoods(foodList);
            applyFilters(foodList);
        } catch (error) {
            console.error('Error fetching foods:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = (foodList) => {
        let filtered = foodList;

        if (searchQuery) {
            filtered = filtered.filter(food =>
                food.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (sortByPriceAsc) {
            filtered = filtered.sort((a, b) => a.price - b.price);
        } else if (sortByPriceDesc) {
            filtered = filtered.sort((a, b) => b.price - a.price);
        }

        setFilteredFoods(filtered);
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchFoods();
        }, [sortByPriceAsc, sortByPriceDesc, searchQuery])
    );

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

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

    const navigateToOrderHistory = () => {
        navigation.navigate('OrderHistory');
    };

    const clearFilters = () => {
        setSortByPriceAsc(false);
        setSortByPriceDesc(false);
        setSearchQuery('');
        fetchFoods();
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
                <Text style={styles.foodPrice}>Rs. {item.price}</Text>
                <TouchableOpacity style={styles.buyButton} onPress={() => handleBuyFood(item)}>
                    <Icon name="cart-outline" size={20} color="#fff" />
                    <Text style={styles.buyButtonText}>Buy</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchbarContainer}>
                <Searchbar
                    placeholder="Search Foods"
                    onChangeText={handleSearch}
                    value={searchQuery}
                    style={styles.searchbar}
                />
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.filterIcon}>
                    <Icon name="filter-outline" size={24} color="#6200EE" />
                </TouchableOpacity>
            </View>

            <Button mode="contained" onPress={clearFilters} style={styles.clearButton}>
                <Icon name="close-circle-outline" size={20} color="#fff" />
                <Text style={styles.clearButtonText}>Clear Filters</Text>
            </Button>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6200EE" />
                </View>
            ) : filteredFoods.length > 0 ? (
                <FlatList
                    data={filteredFoods}
                    renderItem={renderFoodItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.content}
                    numColumns={2}
                />
            ) : (
                <Text style={styles.emptyText}>No foods found</Text>
            )}

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
                <TouchableOpacity style={styles.navbarIcon} onPress={navigateToOrderHistory}>
                    <Icon name="receipt-outline" size={30} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.profileIcon} onPress={navigateToProfile}>
                    <Image source={profileImage} style={styles.profileImage} />
                </TouchableOpacity>
            </View>

            <Modal
                transparent={true}
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Sort by Price</Text>
                        <View style={styles.checkboxContainer}>
                            <Checkbox
                                status={sortByPriceAsc ? 'checked' : 'unchecked'}
                                onPress={() => {
                                    setSortByPriceAsc(true);
                                    setSortByPriceDesc(false);
                                    setModalVisible(false);
                                }}
                            />
                            <Text style={styles.checkboxLabel}>Low to High</Text>
                        </View>
                        <View style={styles.checkboxContainer}>
                            <Checkbox
                                status={sortByPriceDesc ? 'checked' : 'unchecked'}
                                onPress={() => {
                                    setSortByPriceAsc(false);
                                    setSortByPriceDesc(true);
                                    setModalVisible(false);
                                }}
                            />
                            <Text style={styles.checkboxLabel}>High to Low</Text>
                        </View>
                        <Button mode="contained" onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
                            Close
                        </Button>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
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
    searchbarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    searchbar: {
        flex: 1,
        marginRight: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 5,
    },
    filterIcon: {
        padding: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 5,
    },
    clearButton: {
        marginVertical: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#6200EE',
        borderRadius: 5,
        elevation: 5,
    },
    clearButtonText: {
        marginRight: 5,
        color: '#fff',
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    foodCard: {
        backgroundColor: '#ffffff',
        borderRadius: 15,
        overflow: 'hidden',
        margin: 5,
        flex: 1,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
    },
    foodImage: {
        width: '100%',
        height: 150,
    },
    foodCardContent: {
        padding: 10,
    },
    foodName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    foodPrice: {
        fontSize: 16,
        color: '#777',
        marginVertical: 5,
    },
    buyButton: {
        backgroundColor: '#6200EE',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    buyButtonText: {
        color: '#fff',
        fontSize: 14,
        marginLeft: 5,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 18,
        color: '#777',
    },
    content: {
        paddingBottom: 100,
    },
    footerNavbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    navbarIcon: {
        padding: 10,
    },
    profileIcon: {
        padding: 5,
    },
    profileImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#6200EE',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 15,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 16,
        color: '#333',
    },
    modalCloseButton: {
        marginTop: 20,
        backgroundColor: '#6200EE',
        borderRadius: 5,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
});

export default HomeScreen;

