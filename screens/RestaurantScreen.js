import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import * as Location from 'expo-location';

const RestaurantScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [coordinates, setCoordinates] = useState({ latitude: 37.7749, longitude: -122.4194 });

    const firestore = getFirestore();

    const handleAddRestaurant = async () => {
        if (name === '' || address === '' || phone === '' || cuisine === '' || description === '') {
            Alert.alert('Error', 'Please fill out all fields.');
            return;
        }

        try {
            setIsLoading(true);

            await addDoc(collection(firestore, 'restaurants'), {
                name,
                address,
                phone,
                cuisine,
                description,
                coordinates,
            });

            Alert.alert('Success', 'Restaurant added successfully.');
            setName('');
            setAddress('');
            setPhone('');
            setCuisine('');
            setDescription('');
        } catch (error) {
            console.error('Error adding restaurant:', error.message);
            Alert.alert('Error', 'Failed to add restaurant. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchCoordinates = async () => {
            if (address !== '') {
                try {
                    let response = await Location.geocodeAsync(address);
                    if (response.length > 0) {
                        setCoordinates({ latitude: response[0].latitude, longitude: response[0].longitude });
                    }
                } catch (error) {
                    console.error('Error fetching coordinates:', error);
                }
            }
        };

        fetchCoordinates();
    }, [address]);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <MapView
                style={styles.map}
                region={{
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                <UrlTile
                    urlTemplate="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maximumZ={19}
                />
                <Marker coordinate={coordinates} />
            </MapView>

            <View style={styles.content}>
                <View style={styles.inputContainer}>
                    <Icon name="restaurant-outline" size={24} color="#333" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Restaurant Name"
                        value={name}
                        onChangeText={setName}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Icon name="location-outline" size={24} color="#333" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Address"
                        value={address}
                        onChangeText={setAddress}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Icon name="call-outline" size={24} color="#333" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Phone Number"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="numeric"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Icon name="fast-food-outline" size={24} color="#333" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Cuisine Type"
                        value={cuisine}
                        onChangeText={setCuisine}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Icon name="document-text-outline" size={24} color="#333" style={styles.icon} />
                    <TextInput
                        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                        placeholder="Description"
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleAddRestaurant}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>{isLoading ? 'Adding...' : 'Add Restaurant'}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f8f9fa',
        paddingVertical: 20,
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
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 30,
        alignItems: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        width: '100%',
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 40,
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
        width: '100%',
    },
    buttonDisabled: {
        backgroundColor: '#b5c0c6',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
    map: {
        height: 200,
        width: '100%',
        marginBottom: 20,
    },
});

export default RestaurantScreen;
