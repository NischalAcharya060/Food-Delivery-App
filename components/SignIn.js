import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { auth } from '../firebase/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import LogoImage from '../assets/icon.png';

const SignIn = ({ navigation, route }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (route.params?.successMessage) {
            setSuccessMessage(route.params.successMessage);
            setShowSuccessPopup(true);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                setTimeout(() => {
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    }).start(() => {
                        setShowSuccessPopup(false);
                    });
                }, 3000); // Auto hide after 3 seconds
            });
        }
    }, [route.params?.successMessage, fadeAnim]);

    const handleSignIn = () => {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log('User signed in:', user);
                navigation.navigate('Home', { email: user.email });
            })
            .catch((error) => {
                setError(error.message);
            });
    };

    return (
        <View style={styles.container}>
            <Image source={LogoImage} style={styles.logo} resizeMode="contain" />

            <Text style={styles.title}>Login to Your Account</Text>
            {showSuccessPopup && (
                <Animated.View style={[styles.successPopup, { opacity: fadeAnim }]}>
                    <Text style={styles.successText}>{successMessage}</Text>
                </Animated.View>
            )}
            <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={email}
                onChangeText={(text) => setEmail(text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCompleteType="email"
                placeholderTextColor="#aaa"
            />
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCompleteType="password"
                    placeholderTextColor="#aaa"
                />
                <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                >
                    <Icon name={showPassword ? "eye-off" : "eye"} size={20} color="#aaa" />
                </TouchableOpacity>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.signupText}>Don't have an account? Register Here</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#f8f9fa',
        paddingTop: 40,
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 20,
        borderRadius: 75,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
        fontWeight: 'bold',
        textShadowColor: '#aaa',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#fff',
        color: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    passwordContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
        elevation: 3,
    },
    successPopup: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: '#28a745',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    successText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    signupText: {
        marginTop: 20,
        color: '#007bff',
        textDecorationLine: 'none',
        fontSize: 16,
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});

export default SignIn;
