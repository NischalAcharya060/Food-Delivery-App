import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getAuth, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { RadioButton } from 'react-native-paper';

const ProfileScreen = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('user');
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
                }
            } else {
                setEmail('');
                setName('');
                setPhone('');
                setRole('user');
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSaveProfile = async () => {
        try {
            setIsLoading(true);
            const user = auth.currentUser;

            if (user) {
                await updateProfile(user, {
                    displayName: name,
                });

                await setDoc(doc(firestore, 'users', user.uid), {
                    name: name,
                    email: email,
                    phone: phone,
                    role: role,
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
