import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, FlatList, Modal, SafeAreaView } from 'react-native';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import { Searchbar, Button, Checkbox, Badge } from 'react-native-paper';
import Icon from "react-native-vector-icons/Ionicons";

const dummyFoodImage = require('../assets/img/food.jpg');
const dummyProfileImage = require('../assets/img/profile.jpg');

const HomeScreen = ({ navigation }) => {
    const [foods, setFoods] = useState([]);
    const [profileImage, setProfileImage] = useState(dummyProfileImage);
    const [foodImage, setFoodImage] = useState(dummyFoodImage);
    const [loading, setLoading] = useState(true);
    const [sortByPriceAsc, setSortByPriceAsc] = useState(false);
    const [sortByPriceDesc, setSortByPriceDesc] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredFoods, setFilteredFoods] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [cart, setCart] = useState([]);

    const auth = getAuth();
    const firestore = getFirestore();

    const fetchProfileImage = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const userDoc = await getDoc(doc(firestore, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setProfileImage(userData.profilePicture || dummyProfileImage);
                }
            }
        } catch (error) {
            console.error('Error fetching profile image:', error.message);
        }
    };

    const fetchFoods = async () => {
        setLoading(true);
        try {
            let foodCollection = collection(firestore, 'foods');
            const foodSnapshot = await getDocs(foodCollection);
            const foodList = foodSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                image: doc.data().image || dummyFoodImage,
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
            fetchProfileImage();
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
        const existingItem = cart.find(item => item.id === food.id);

        if (existingItem) {
            const updatedCart = cart.map(item =>
                item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item
            );
            setCart(updatedCart);
        } else {
            setCart(prevCart => [...prevCart, { ...food, quantity: 1 }]);
        }
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
        setCart([]);
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
                source={item.foodImage ? { uri: item.foodImage } : dummyFoodImage}
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
                    <Image source={profileImage ? { uri: profileImage } : dummyProfileImage} style={styles.profileImage} />
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
                        <Button
                            mode="text"
                            onPress={() => setModalVisible(false)}
                            style={styles.modalCloseButton}
                            icon="close"
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
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
        backgroundColor: '#3700B3',
        paddingBottom: 15,
        paddingTop: 10,
        paddingHorizontal: 15,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5,
    },
    searchbarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15,
        paddingHorizontal: 15,
    },
    searchbar: {
        flex: 1,
        marginRight: 10,
        backgroundColor: '#fff',
        borderRadius: 25,
        elevation: 5,
        paddingHorizontal: 20,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    filterIcon: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 25,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cartIcon: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 25,
        elevation: 5,
        marginLeft: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cartBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#d32f2f',
        color: '#fff',
        borderRadius: 10,
        padding: 4,
        fontSize: 12,
        minWidth: 20,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    clearButton: {
        marginTop: 6,
        backgroundColor: '#d32f2f',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        elevation: 3,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    clearButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
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
        margin: 10,
        backgroundColor: '#fff',
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    foodImage: {
        width: '100%',
        height: 150,
    },
    foodCardContent: {
        padding: 15,
    },
    foodName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    foodDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    foodPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6200EE',
        marginBottom: 10,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    buyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6200EE',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 25,
    },
    buyButtonText: {
        color: '#fff',
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
    favoriteButton: {
        padding: 8,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#6200EE',
    },
    favoriteIcon: {
        color: '#6200EE',
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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    modalContent: {
        width: 340,
        padding: 30,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 25,
        textAlign: 'center',
        color: '#333333',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    checkboxLabel: {
        marginLeft: 12,
        fontSize: 16,
        color: '#555555',
    },
    modalCloseButton: {
        marginTop: 20,
        alignSelf: 'center',
        backgroundColor: '#ff6347',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    closeButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default HomeScreen;
