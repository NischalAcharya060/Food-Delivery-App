import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

const AddFoodScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [description, setDescription] = useState('');
    const [restaurants, setRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const firestore = getFirestore();

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const restaurantCollection = collection(firestore, 'restaurants');
                const restaurantSnapshot = await getDocs(restaurantCollection);
                const restaurantList = restaurantSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setRestaurants(restaurantList);
            } catch (error) {
                console.error('Error fetching restaurants:', error.message);
            }
        };

        fetchRestaurants();
    }, []);

    const handleRestaurantSelect = (restaurantId) => {
        if (selectedRestaurant === restaurantId) {
            setSelectedRestaurant(null); // Deselect if already selected
        } else {
            setSelectedRestaurant(restaurantId); // Select the new restaurant
        }
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
            });

            Alert.alert('Success', 'Food added successfully.');
            setName('');
            setPrice('');
            setSelectedRestaurant(null);
            setDescription('');
        } catch (error) {
            console.error('Error adding food:', error.message);
            Alert.alert('Error', 'Failed to add food. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Add Food</Text>
            </View>

            <View style={styles.content}>
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
                    <TextInput
                        style={styles.input}
                        placeholder="Price"
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                    />
                </View>
                <View style={styles.checkboxContainer}>
                    <Text style={styles.checkboxLabel}>Select Restaurant:</Text>
                    {restaurants.map(rest => (
                        <TouchableOpacity
                            key={rest.id}
                            style={[styles.checkbox, selectedRestaurant === rest.id && styles.checkboxSelected]}
                            onPress={() => handleRestaurantSelect(rest.id)}
                        >
                            <View style={styles.checkboxContent}>
                                {selectedRestaurant === rest.id && (
                                    <Icon name="checkmark" size={16} color="#fff" />
                                )}
                                <Text style={styles.checkboxText}>{rest.name}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.inputContainer}>
                    <Icon name="document-text-outline" size={24} color="#333" style={styles.icon} />
                    <TextInput
                        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                        placeholder="Description"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleAddFood}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Add Food</Text>
                    )}
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
    header: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    icon: {
        marginRight: 10,
        marginLeft: 10,
    },
    input: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: '#333',
    },
    checkboxContainer: {
        marginBottom: 20,
    },
    checkboxLabel: {
        fontSize: 16,
        marginBottom: 10,
        marginLeft: 10,
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    checkboxSelected: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
    },
    checkboxContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    button: {
        backgroundColor: '#007bff',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    buttonDisabled: {
        backgroundColor: '#b5c0c6',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
});

export default AddFoodScreen;
