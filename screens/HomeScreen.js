import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, FlatList, Animated, Easing, Modal } from 'react-native';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { Searchbar, FAB, Button, Checkbox } from 'react-native-paper';
import Icon from "react-native-vector-icons/Ionicons";

const dummyFoodImage = require('../assets/img/food.png');
const dummyProfileImage = require('../assets/img/profile.jpg');

const HomeScreen = ({ navigation }) => {
    const [foods, setFoods] = useState([]);
    const [profileImage, setProfileImage] = useState(dummyProfileImage);
    const [loading, setLoading] = useState(true);
    const [sortByPriceAsc, setSortByPriceAsc] = useState(false);
    const [sortByPriceDesc, setSortByPriceDesc] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredFoods, setFilteredFoods] = useState([]);
    const [fabVisible, setFabVisible] = useState(true);
    const animatedValue = new Animated.Value(0);
    const [modalVisible, setModalVisible] = useState(false);

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

            // Apply search filter
            const filtered = foodList.filter(food =>
                food.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            setFoods(foodList);
            setFilteredFoods(filtered);
        } catch (error) {
            console.error('Error fetching foods:', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch foods on initial load
    useFocusEffect(
        React.useCallback(() => {
            fetchFoods();
        }, [firestore, sortByPriceAsc, sortByPriceDesc, searchQuery])
    );

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

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

    // Navigate to order History
    const navigateToOrderHistory = () => {
        navigation.navigate('OrderHistory');
    };

    const toggleFabVisibility = () => {
        setFabVisible(!fabVisible);
    };

    const clearFilters = () => {
        setSortByPriceAsc(false);
        setSortByPriceDesc(false);
        setSearchQuery('');
        fetchFoods();
    };

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: fabVisible ? 0 : 1,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
        }).start();
    }, [fabVisible, animatedValue]);

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
            {/* Searchbar and Filter Icon */}
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

            {/* Clear Filters Button */}
            <Button mode="contained" onPress={clearFilters} style={styles.clearButton}>
                Clear Filters
            </Button>

            {/* Main Content */}
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
                <TouchableOpacity style={styles.navbarIcon} onPress={navigateToOrderHistory}>
                    <Icon name="receipt-outline" size={30} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.profileIcon} onPress={navigateToProfile}>
                    <Image source={profileImage} style={styles.profileImage} />
                </TouchableOpacity>
            </View>

            {/* Floating Action Button */}
            <Animated.View
                style={[
                    styles.fabContainer,
                    {
                        transform: [
                            {
                                translateY: animatedValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 100]
                                })
                            }
                        ]
                    }
                ]}
            >
                <FAB
                    icon="plus"
                    style={styles.fab}
                    onPress={navigateToAddFood}
                />
            </Animated.View>

            {/* Sorting Modal */}
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
                                    fetchFoods();
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
                                    fetchFoods();
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
    searchbarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    searchbar: {
        flex: 1,
    },
    filterIcon: {
        marginLeft: 10,
    },
    clearButton: {
        marginBottom: 10,
        alignSelf: 'center',
        width: '90%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flexGrow: 1,
    },
    foodCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        margin: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    foodImage: {
        width: '100%',
        height: 100,
        borderRadius: 10,
    },
    foodCardContent: {
        alignItems: 'center',
    },
    foodName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
    },
    foodPrice: {
        fontSize: 16,
        color: '#888',
        marginVertical: 5,
    },
    buyButton: {
        backgroundColor: '#6200EE',
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginTop: 5,
    },
    buyButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    emptyText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
    footerNavbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 10,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    navbarIcon: {
        flex: 1,
        alignItems: 'center',
    },
    profileIcon: {
        flex: 1,
        alignItems: 'center',
        marginRight: 10,
    },
    profileImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    fabContainer: {
        position: 'absolute',
        right: 20,
        bottom: 80,
    },
    fab: {
        backgroundColor: '#6200EE',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
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
        marginTop: 20,
    },
});

export default HomeScreen;
