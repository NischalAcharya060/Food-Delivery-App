import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getAuth, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const dummyImage = require('../assets/icon.png'); // Replace with the path to your dummy image

const ProfileScreen = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [photoURL, setPhotoURL] = useState(null);
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const auth = getAuth();
    const storage = getStorage();
    const firestore = getFirestore();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setEmail(user.email);
                setPhotoURL(user.photoURL); // Set photo URL if available

                // Fetch additional profile data from Firestore
                const userDoc = await getDoc(doc(firestore, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setPhone(userData.phone || '');
                    setName(userData.name || '');
                }
            } else {
                setEmail('');
                setName('');
                setPhone('');
                setPhotoURL(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleImageUpload = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.cancelled) {
            setImage(result.uri); // Set selected image URI
        }
    };

    const handleSaveProfile = async () => {
        try {
            setIsLoading(true);
            const user = auth.currentUser;

            if (user) {
                let downloadURL = photoURL;

                if (image) {
                    const response = await fetch(image);
                    const blob = await response.blob();
                    const storageRef = ref(storage, `profileImages/${user.uid}`);
                    await uploadBytes(storageRef, blob);
                    downloadURL = await getDownloadURL(storageRef);
                    console.log('Image uploaded successfully:', downloadURL); // Log image URL
                }

                await updateProfile(user, {
                    displayName: name,
                    photoURL: downloadURL,
                });

                // Save profile data to Firestore
                await setDoc(doc(firestore, 'users', user.uid), {
                    name: name,
                    email: email,
                    phone: phone,
                    photoURL: downloadURL,
                });

                // Update the state with the new values
                setPhotoURL(downloadURL);

                Alert.alert('Profile Updated', 'Your profile has been updated successfully.');
            }
        } catch (error) {
            console.error('Error updating profile:', error.message);
            Alert.alert('Error', 'Failed to update profile. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Profile</Text>
            </View>

            <View style={styles.content}>
                <TouchableOpacity style={styles.imageButton} onPress={handleImageUpload}>
                    {photoURL ? (
                        <Image source={{ uri: photoURL }} style={styles.currentImage} resizeMode="cover" />
                    ) : (
                        <Image source={dummyImage} style={styles.currentImage} resizeMode="cover" />
                    )}
                    <View style={styles.cameraIcon}>
                        <Icon name="camera" size={24} color="#fff" />
                    </View>
                </TouchableOpacity>

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

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleSaveProfile}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>{isLoading ? 'Updating...' : 'Update Profile'}</Text>
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
        alignItems: 'center',
    },
    imageButton: {
        position: 'relative',
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        marginBottom: 20,
    },
    currentImage: {
        width: '100%',
        height: '100%',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 8,
        borderRadius: 20,
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
});

export default ProfileScreen;
