import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getAuth, updateProfile, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { RadioButton } from 'react-native-paper';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';

// Dummy profile picture URL or local require statement for image
const dummyProfilePicture = require('../assets/img/profile.jpg');

const ProfileScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('user');
    const [address, setAddress] = useState('');
    const [coordinates, setCoordinates] = useState({ latitude: 37.7749, longitude: -122.4194 });
    const [isLoading, setIsLoading] = useState(false);

    const auth = getAuth();
    const firestore = getFirestore();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setEmail(user.email);

                const userDoc = await getDoc(doc(firestore, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setPhone(userData.phone || '');
                    setName(userData.name || '');
                    setRole(userData.role || 'user');
                    setAddress(userData.address || '');
                    setCoordinates(userData.coordinates || { latitude: 37.7749, longitude: -122.4194 });
                }
            } else {
                setEmail('');
                setName('');
                setPhone('');
                setRole('user');
                setAddress('');
                setCoordinates({ latitude: 37.7749, longitude: -122.4194 });
            }
        });

        return () => unsubscribe();
    }, []);

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

    const handleSaveProfile = async () => {
        try {
            setIsLoading(true);
            const user = auth.currentUser;

            if (user) {
                await updateProfile(user, {
                    displayName: name,
                });

                await setDoc(doc(firestore, 'users', user.uid), {
                    name,
                    email,
                    phone,
                    role,
                    address,
                    coordinates,
                });

                Alert.alert('Profile Updated', 'Your profile has been updated successfully.');
            }
        } catch (error) {
            console.error('Error updating profile:', error.message);
            Alert.alert('Error', 'Failed to update profile. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigation.navigate('Login');
        } catch (error) {
            console.error('Error signing out:', error.message);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Image source={dummyProfilePicture} style={styles.profileImage} />

                <View style={styles.inputContainer}>
                    <Icon name="person-outline" size={24} color="#333" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Icon name="mail-outline" size={24} color="#333" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        editable={false}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Icon name="call-outline" size={24} color="#333" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Phone"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />
                </View>
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
                        urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maximumZ={19}
                    />
                    <Marker coordinate={coordinates} />
                </MapView>
                <View style={styles.inputContainer}>
                    <Icon name="home-outline" size={24} color="#333" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Address"
                        value={address}
                        onChangeText={setAddress}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Icon name="person-outline" size={24} color="#333" style={styles.icon} />
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ marginRight: 10 }}>Role:</Text>
                        <RadioButton.Group
                            onValueChange={(newValue) => setRole(newValue)}
                            value={role}
                        >
                            <View style={{ flexDirection: 'row' }}>
                                <RadioButton.Item label="Admin" value="admin" color="#007bff" />
                                <RadioButton.Item label="User" value="user" color="#007bff" />
                            </View>
                        </RadioButton.Group>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleSaveProfile}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>{isLoading ? 'Updating...' : 'Update Profile'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutButtonText}>Logout</Text>
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
    logoutButton: {
        marginTop: 10,
    },
    logoutButtonText: {
        color: '#dc3545',
        fontSize: 16,
    },
    map: {
        height: 200,
        width: '100%',
        marginBottom: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 20,
    },
});

export default ProfileScreen;
