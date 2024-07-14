import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, FlatList, Modal, SafeAreaView } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { Searchbar, Button, Checkbox, Badge } from 'react-native-paper';
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
    const [cart, setCart] = useState([]);

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

    const handleAddToCart = (food) => {
        setCart(prevCart => [...prevCart, food]);
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

    const navigateToCart = () => {
        navigation.navigate('Cart', { cart });
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
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.buyButton} onPress={() => handleBuyFood(item)}>
                        <Icon name="cart-outline" size={20} color="#fff" />
                        <Text style={styles.buyButtonText}>Buy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.favoriteButton} onPress={() => handleAddToCart(item)}>
                        <Icon name="cart-outline" size={20} color="#6200EE" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
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
                    <TouchableOpacity style={styles.cartIcon} onPress={navigateToCart}>
                        <Icon name="cart-outline" size={24} color="#6200EE" />
                        {cart.length > 0 && (
                            <Badge style={styles.cartBadge}>{cart.length}</Badge>
                        )}
                    </TouchableOpacity>
                </View>
                <Button mode="contained" onPress={clearFilters} style={styles.clearButton}>
                    <Icon name="close-circle-outline" size={20} color="#fff" />
                    <Text style={styles.clearButtonText}>Clear Filters</Text>
                </Button>
            </View>

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
                    <Icon name="home-outline" size={30} color="#6200EE" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navbarIcon} onPress={navigateToRestaurant}>
                    <Icon name="restaurant-outline" size={30} color="#6200EE" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navbarIcon} onPress={navigateToAddFood}>
                    <Icon name="add-circle-outline" size={30} color="#6200EE" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navbarIcon} onPress={navigateToOrderHistory}>
                    <Icon name="receipt-outline" size={30} color="#6200EE" />
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
        position: 'relative',
    },
    header: {
        backgroundColor: '#6200EE',
        paddingBottom: 20,
        paddingTop: 10,
        paddingHorizontal: 10,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
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
        borderRadius: 20,
        elevation: 5,
    },
    filterIcon: {
        padding: 5,
        backgroundColor: '#fff',
        borderRadius: 20,
        elevation: 5,
    },
    cartIcon: {
        padding: 5,
        backgroundColor: '#fff',
        borderRadius: 20,
        elevation: 5,
        marginLeft: 10,
    },
    cartBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#d32f2f',
        color: '#fff',
    },
    clearButton: {
        marginTop: 10,
        backgroundColor: '#d32f2f',
    },
    clearButtonText: {
        color: '#fff',
        marginLeft: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 10,
    },
    foodCard: {
        flex: 1,
        margin: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 5,
    },
    foodImage: {
        width: '100%',
        height: 120,
    },
    foodCardContent: {
        padding: 10,
    },
    foodName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    foodPrice: {
        fontSize: 14,
        color: '#6200EE',
        marginVertical: 5,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    buyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6200EE',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    buyButtonText: {
        color: '#fff',
        marginLeft: 5,
    },
    favoriteButton: {
        padding: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#6200EE',
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        marginTop: 20,
    },
    footerNavbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    navbarIcon: {
        alignItems: 'center',
    },
    profileIcon: {
        alignItems: 'center',
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
        width: 300,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    checkboxLabel: {
        marginLeft: 10,
        fontSize: 16,
    },
    modalCloseButton: {
        marginTop: 10,
    },
});

export default HomeScreen;
