import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';

const AddFoodScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [description, setDescription] = useState('');
    const [restaurants, setRestaurants] = useState([]);
    const [foodImage, setFoodImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRestaurantLoading, setIsRestaurantLoading] = useState(false);

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
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.headerText}>Add Food</Text>
            <View style={styles.imageContainer}>
                {foodImage ? (
                    <Image source={{ uri: foodImage }} style={styles.foodImage} />
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
                                <Text style={[styles.checkboxText, selectedRestaurant === rest.id && styles.checkboxTextSelected]}>
                                    {rest.name}
                                </Text>
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
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    contentContainer: {
        padding: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007bff',
        textAlign: 'center',
        marginBottom: 20,
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
    currencyPrefix: {
        fontSize: 16,
        color: '#333',
        marginRight: 5,
    },
    checkboxContainer: {
        marginBottom: 20,
    },
    checkboxLabel: {
        fontSize: 16,
        marginBottom: 10,
        marginLeft: 10,
        color: '#333',
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#007bff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    checkboxSelected: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
    },
    checkboxContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxIcon: {
        marginRight: 10,
    },
    checkboxText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#007bff',
    },
    checkboxTextSelected: {
        color: '#fff',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007bff',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        flex: 1,
        marginRight: 10,
    },
    buttonDisabled: {
        backgroundColor: '#b5c0c6',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        marginLeft: 10,
    },
    buttonIcon: {
        marginRight: 10,
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ddd',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        flex: 1,
    },
    clearButtonText: {
        color: '#333',
        fontSize: 18,
        marginLeft: 10,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    addImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#007bff',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    addImageText: {
        marginLeft: 10,
        color: '#333',
        fontSize: 16,
    },
    foodImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
    },
});

export default AddFoodScreen;
