// Import necessary modules and components
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { auth, storage } from '../firebase/firebaseConfig'; // Import Firebase auth and storage
import * as ImagePicker from 'expo-image-picker'; // Import Expo ImagePicker for picking images

const dummyImage = require('../assets/icon.png');

const ProfileScreen = ({ navigation, route }) => {
    const [name, setName] = useState('John Doe');
    const [phone, setPhone] = useState('123-456-7890');
    const [email, setEmail] = useState('');
    const [photoURL, setPhotoURL] = useState(null); // State for storing photo URL
    const [image, setImage] = useState(null); // State for storing image data

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setEmail(user.email);
                setPhotoURL(user.photoURL); // Set photo URL if available
            } else {
                setEmail('');
                setPhotoURL(null);
            }
        });

        return () => unsubscribe();
    }, []);

    // Function to handle image upload
    const handleImageUpload = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            setImage(result.uri); // Set selected image URI
        }
    };

    // Function to handle profile update
    const handleSaveProfile = async () => {
        try {
            const user = auth.currentUser;

            // Update profile data in Firebase
            await user.updateProfile({
                displayName: name,
                photoURL: photoURL,
            });

            // Optionally, upload image to Firebase Storage
            if (image) {
                const response = await fetch(image);
                const blob = await response.blob();
                const storageRef = storage.ref().child(`profileImages/${user.uid}`);
                await storageRef.put(blob);
                const downloadURL = await storageRef.getDownloadURL();
                setPhotoURL(downloadURL); // Update photoURL state with download URL
            }

            Alert.alert('Profile Updated', 'Your profile has been updated successfully.');
        } catch (error) {
            console.error('Error updating profile:', error.message);
            Alert.alert('Error', 'Failed to update profile. Please try again later.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Profile</Text>
            </View>

            <View style={styles.content}>
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
                <TouchableOpacity style={styles.button} onPress={handleImageUpload}>
                    <Text style={styles.buttonText}>Select Photo</Text>
                </TouchableOpacity>
                {photoURL ? (
                    <Image source={{ uri: photoURL }} style={styles.currentImage} resizeMode="cover" />
                ) : (
                    <Image source={dummyImage} style={styles.currentImage} resizeMode="cover" />
                )}
                {image && (
                    <Image source={{ uri: image }} style={styles.imagePreview} resizeMode="cover" />
                )}
                <TouchableOpacity style={styles.button} onPress={handleSaveProfile}>
                    <Text style={styles.buttonText}>Update Profile</Text>
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
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
    currentImage: {
        width: '100%',
        height: 200,
        marginTop: 20,
        borderRadius: 8,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        marginTop: 20,
        borderRadius: 8,
    },
});

export default ProfileScreen;
