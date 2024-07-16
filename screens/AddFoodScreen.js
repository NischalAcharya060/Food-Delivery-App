import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { Provider, Modal, Portal, Button, Card } from 'react-native-paper';

const AddFoodScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [description, setDescription] = useState('');
    const [restaurants, setRestaurants] = useState([]);
    const [foodImage, setFoodImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRestaurantLoading, setIsRestaurantLoading] = useState(false);
    const [foods, setFoods] = useState([]);
    const [visible, setVisible] = useState(false);

    const firestore = getFirestore();

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                setIsRestaurantLoading(true);
                const restaurantCollection = collection(firestore, 'restaurants');
                const restaurantSnapshot = await getDocs(restaurantCollection);
                const restaurantList = restaurantSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setRestaurants(restaurantList);
            } catch (error) {
                console.error('Error fetching restaurants:', error.message);
            } finally {
                setIsRestaurantLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

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

    const handleRestaurantSelect = (restaurantId) => {
        setSelectedRestaurant(prev => (prev === restaurantId ? null : restaurantId));
    };

    const handleAddFood = async () => {
        if (name === '' || price === '' || !selectedRestaurant || description === '') {
            Alert.alert('Error', 'Please fill out all fields and select a restaurant.');
            return;
        }

        try {
            setIsLoading(true);

            await addDoc(collection(firestore, 'foods'), {
                name,
                price,
                restaurant: selectedRestaurant,
                description,
                foodImage,
            });

            Alert.alert('Success', 'Food added successfully.');
            setName('');
            setPrice('');
            setSelectedRestaurant(null);
            setDescription('');
            setFoodImage(null);
        } catch (error) {
            console.error('Error adding food:', error.message);
            Alert.alert('Error', 'Failed to add food. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setFoodImage(result.assets[0].uri);
        }
    };

    const handleClear = () => {
        setName('');
        setPrice('');
        setSelectedRestaurant(null);
        setDescription('');
        setFoodImage(null);
    };

    const handleDeleteFood = async (id) => {
        try {
            await deleteDoc(doc(firestore, 'foods', id));
            setFoods(foods.filter(food => food.id !== id));
            Alert.alert('Success', 'Food deleted successfully.');
        } catch (error) {
            console.error('Error deleting food:', error.message);
            Alert.alert('Error', 'Failed to delete food. Please try again later.');
        }
    };

    const renderFoodItem = ({ item }) => (
        <Card style={styles.foodItemContainer}>
            <Card.Content>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodPrice}>NPR {item.price}</Text>
                <Image source={{ uri: item.foodImage }} style={styles.foodImage} />
            </Card.Content>
            <Card.Actions>
                <Button onPress={() => setVisible(true)}>Edit</Button>
                <Button onPress={() => handleDeleteFood(item.id)}>Delete</Button>
            </Card.Actions>
        </Card>
    );

    return (
        <Provider>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.headerText}>Add Food</Text>
                <View style={styles.imageContainer}>
                    {foodImage ? (
                        <>
                            <Image source={{ uri: foodImage }} style={styles.foodImage} />
                            <TouchableOpacity style={styles.removeImageButton} onPress={() => setFoodImage(null)}>
                                <Icon name="close-circle-outline" size={24} color="#ff4d4d" />
                                <Text style={styles.removeImageText}>Remove Image</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                            <Icon name="camera-outline" size={24} color="#333" />
                            <Text style={styles.addImageText}>Add Food Image</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.inputContainer}>
                    <Icon name="fast-food-outline" size={24} color="#333" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Food Name"
                        value={name}
                        onChangeText={setName}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Icon name="pricetag-outline" size={24} color="#333" style={styles.icon} />
                    <Text style={styles.currencyPrefix}>NPR</Text>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Price"
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                    />
                </View>
                <View style={styles.checkboxContainer}>
                    <Text style={styles.checkboxLabel}>Select Restaurant:</Text>
                    {isRestaurantLoading ? (
                        <ActivityIndicator size="large" color="#007bff" />
                    ) : (
                        restaurants.map(rest => (
                            <TouchableOpacity
                                key={rest.id}
                                style={[styles.checkbox, selectedRestaurant === rest.id && styles.checkboxSelected]}
                                onPress={() => handleRestaurantSelect(rest.id)}
                            >
                                <View style={styles.checkboxContent}>
                                    {selectedRestaurant === rest.id && (
                                        <Icon name="checkmark" size={16} color="#fff" style={styles.checkboxIcon} />
                                    )}
                                    <View>
                                        <Text style={[styles.checkboxText, selectedRestaurant === rest.id && styles.checkboxTextSelected]}>
                                            {rest.name}
                                        </Text>
                                        <Text style={styles.checkboxSubText}>{rest.cuisine}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
                <View style={[styles.inputContainer, { height: 100 }]}>
                    <Icon name="document-text-outline" size={24} color="#333" style={styles.icon} />
                    <TextInput
                        style={[styles.input, { height: '100%', textAlignVertical: 'top' }]}
                        placeholder="Description"
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleAddFood}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Icon name="add-circle-outline" size={24} color="#fff" style={styles.buttonIcon} />
                                <Text style={styles.buttonText}>Add Food</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                        <Icon name="close-circle-outline" size={24} color="#333" style={styles.buttonIcon} />
                        <Text style={styles.clearButtonText}>Clear</Text>
                    </TouchableOpacity>
                </View>
                <Text style={                    styles.subHeaderText}>Food List</Text>
                <FlatList
                    data={foods}
                    renderItem={renderFoodItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.foodListContainer}
                />
            </ScrollView>
            <Portal>
                <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modalContainer}>
                    <Text>Edit Food</Text>
                    {/* Add form inputs and functionality for editing food items here */}
                    <Button onPress={() => setVisible(false)}>Close</Button>
                </Modal>
            </Portal>
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    contentContainer: {
        padding: 16,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    subHeaderText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        color: '#333',
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    foodImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginBottom: 8,
    },
    addImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        padding: 10,
        borderRadius: 8,
    },
    addImageText: {
        marginLeft: 8,
        color: '#333',
    },
    removeImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffcccc',
        padding: 10,
        borderRadius: 8,
    },
    removeImageText: {
        marginLeft: 8,
        color: '#ff4d4d',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginBottom: 16,
        elevation: 2,
    },
    icon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    currencyPrefix: {
        fontSize: 16,
        color: '#333',
        marginRight: 4,
    },
    checkboxContainer: {
        marginBottom: 16,
    },
    checkboxLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        marginBottom: 8,
    },
    checkboxSelected: {
        backgroundColor: '#007bff',
    },
    checkboxContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxIcon: {
        marginRight: 8,
    },
    checkboxText: {
        fontSize: 16,
        color: '#333',
    },
    checkboxTextSelected: {
        color: '#fff',
    },
    checkboxSubText: {
        fontSize: 12,
        color: '#666',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 8,
        flex: 1,
        justifyContent: 'center',
        marginRight: 8,
    },
    buttonDisabled: {
        backgroundColor: '#b0d4ff',
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        fontSize: 16,
        color: '#fff',
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        padding: 12,
        borderRadius: 8,
        flex: 1,
        justifyContent: 'center',
    },
    clearButtonText: {
        fontSize: 16,
        color: '#333',
    },
    foodListContainer: {
        paddingTop: 8,
    },
    foodItemContainer: {
        marginBottom: 16,
    },
    foodName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    foodPrice: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        marginHorizontal: 20,
        borderRadius: 8,
    },
});

export default AddFoodScreen;
