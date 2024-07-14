import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getAuth, updateProfile, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { RadioButton, Button, Snackbar } from 'react-native-paper';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

const dummyProfilePicture = require('../assets/img/profile.jpg');

const ProfileScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('user');
    const [address, setAddress] = useState('');
    const [coordinates, setCoordinates] = useState({ latitude: 37.7749, longitude: -122.4194 });
    const [isLoading, setIsLoading] = useState(true);
    const [profilePicture, setProfilePicture] = useState(null);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [nameError, setNameError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [addressError, setAddressError] = useState('');


    const auth = getAuth();
    const firestore = getFirestore();

    const validateForm = () => {
        let valid = true;
        if (name.trim() === '') {
            setNameError('Name is required');
            valid = false;
        } else {
            setNameError('');
        }

        if (phone.trim() === '' || !/^\d+$/.test(phone)) {
            setPhoneError('Valid phone number is required');
            valid = false;
        } else {
            setPhoneError('');
        }

        if (address.trim() === '') {
            setAddressError('Address is required');
            valid = false;
        } else {
            setAddressError('');
        }

        return valid;
    };

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
                    setProfilePicture(userData.profilePicture || null);
                }
            } else {
                setEmail('');
                setName('');
                setPhone('');
                setRole('user');
                setAddress('');
                setCoordinates({ latitude: 37.7749, longitude: -122.4194 });
            }
            setIsLoading(false);
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
        if (!validateForm()) {
            return;
        }

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
                    profilePicture,
                });

                setSnackbarMessage('Profile Updated Successfully');
                setSnackbarVisible(true);
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

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setProfilePicture(result.assets[0].uri);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.content}>
                <TouchableOpacity onPress={pickImage} style={styles.profilePictureContainer}>
                    <Image source={profilePicture ? { uri: profilePicture } : dummyProfilePicture} style={styles.profileImage} />
                    <Text style={styles.editPhotoText}>Edit Photo</Text>
                </TouchableOpacity>

                <View style={styles.inputContainer}>
                    <Icon name="person-outline" size={24} color="#007bff" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />
                </View>
                {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

                <View style={styles.inputContainer}>
                    <Icon name="mail-outline" size={24} color="#007bff" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        editable={false}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Icon name="call-outline" size={24} color="#007bff" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Phone"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />
                </View>
                {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

                <View style={styles.inputContainer}>
                    <Icon name="home-outline" size={24} color="#007bff" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Address"
                        value={address}
                        onChangeText={setAddress}
                    />
                </View>
                {addressError ? <Text style={styles.errorText}>{addressError}</Text> : null}

                <View style={styles.inputContainer}>
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
                </View>

                <View style={styles.inputContainer}>
                    <Icon name="person-outline" size={24} color="#007bff" style={styles.icon} />
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

                <Button
                    mode="contained"
                    onPress={handleSaveProfile}
                    loading={isLoading}
                    style={styles.button}
                    disabled={isLoading}
                >
                    <Icon name="save-outline" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Update Profile</Text>
                </Button>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Icon name="log-out-outline" size={20} color="#dc3545" style={styles.buttonIcon} />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={Snackbar.DURATION_SHORT}
                style={styles.snackbar}
            >
                {snackbarMessage}
            </Snackbar>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        alignItems: 'center',
    },
    profilePictureContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#007bff',
    },
    editPhotoText: {
        color: '#007bff',
        fontSize: 16,
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
    map: {
        height: 200,
        width: '100%',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007bff',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        width: '100%',
        flexDirection: 'row',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
    buttonIcon: {
        marginRight: 10,
    },
    logoutButton: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#dc3545',
        fontSize: 16,
        marginLeft: 5,
    },
    snackbar: {
        backgroundColor: '#007bff',
    },
    errorText: {
        color: '#dc3545',
        marginTop: -15,
        marginBottom: 15,
        alignSelf: 'flex-start',
    },
});

export default ProfileScreen;