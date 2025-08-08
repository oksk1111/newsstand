import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
} from 'react-native';
import {
    TextInput,
    Button,
    Text,
    Card,
    Title,
    Paragraph,
    Divider,
    HelperText,
} from 'react-native-paper';

import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner, ErrorDisplay, Toast } from '../components';

export default function LoginScreen() {
    const [email, setEmail] = useState('test@example.com');
    const [password, setPassword] = useState('testpass123');
    const [name, setName] = useState('Test User');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

    // 폼 검증 상태
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [nameError, setNameError] = useState('');

    // 애니메이션
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(50))[0];

    const { login, register, createGuestSession } = useAuth();

    React.useEffect(() => {
        // 컴포넌트 마운트 시 애니메이션
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const displayToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            setEmailError('이메일을 입력해주세요.');
            return false;
        }
        if (!emailRegex.test(email)) {
            setEmailError('올바른 이메일 형식을 입력해주세요.');
            return false;
        }
        setEmailError('');
        return true;
    };

    const validatePassword = (password: string): boolean => {
        if (!password.trim()) {
            setPasswordError('비밀번호를 입력해주세요.');
            return false;
        }
        if (password.length < 6) {
            setPasswordError('비밀번호는 6자 이상이어야 합니다.');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const validateName = (name: string): boolean => {
        if (!isLogin) {
            if (!name.trim()) {
                setNameError('이름을 입력해주세요.');
                return false;
            }
            if (name.trim().length < 2) {
                setNameError('이름은 2자 이상이어야 합니다.');
                return false;
            }
        }
        setNameError('');
        return true;
    };

    const handleLogin = async () => {
        if (!validateEmail(email) || !validatePassword(password)) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await login(email, password);
            displayToast('로그인되었습니다!', 'success');
        } catch (error) {
            console.error('Login failed:', error);
            setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
            displayToast('로그인에 실패했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!validateEmail(email) || !validatePassword(password) || !validateName(name)) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await register(email, password, name);
            displayToast('회원가입이 완료되었습니다!', 'success');
        } catch (error) {
            console.error('Registration failed:', error);
            setError('회원가입에 실패했습니다. 다시 시도해주세요.');
            displayToast('회원가입에 실패했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            await createGuestSession();
            displayToast('게스트로 로그인되었습니다!', 'success');
        } catch (error) {
            console.error('Guest login failed:', error);
            setError('게스트 로그인에 실패했습니다.');
            displayToast('게스트 로그인에 실패했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleModeSwitch = () => {
        setIsLogin(!isLogin);
        setError(null);
        setEmailError('');
        setPasswordError('');
        setNameError('');
    };

    const handleRetry = () => {
        setError(null);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Animated.View
                    style={[
                        styles.header,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={styles.logo}>📰</Text>
                    <Title style={styles.title}>Newsstand</Title>
                    <Paragraph style={styles.subtitle}>
                        개인화된 뉴스 요약 서비스
                    </Paragraph>
                </Animated.View>

                {error && (
                    <ErrorDisplay
                        title="로그인 오류"
                        message={error}
                        onRetry={handleRetry}
                        retryText="다시 시도"
                        icon="🔐"
                    />
                )}

                <Animated.View
                    style={[
                        { opacity: fadeAnim },
                        { transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.cardTitle}>
                                {isLogin ? '로그인' : '회원가입'}
                            </Text>

                            <TextInput
                                label="이메일"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (emailError) validateEmail(text);
                                }}
                                onBlur={() => validateEmail(email)}
                                mode="outlined"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={styles.input}
                                error={!!emailError}
                                disabled={loading}
                                left={<TextInput.Icon icon="email" />}
                            />
                            <HelperText type="error" visible={!!emailError}>
                                {emailError}
                            </HelperText>

                            <TextInput
                                label="비밀번호"
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    if (passwordError) validatePassword(text);
                                }}
                                onBlur={() => validatePassword(password)}
                                mode="outlined"
                                secureTextEntry
                                style={styles.input}
                                error={!!passwordError}
                                disabled={loading}
                                left={<TextInput.Icon icon="lock" />}
                            />
                            <HelperText type="error" visible={!!passwordError}>
                                {passwordError}
                            </HelperText>

                            {!isLogin && (
                                <>
                                    <TextInput
                                        label="이름"
                                        value={name}
                                        onChangeText={(text) => {
                                            setName(text);
                                            if (nameError) validateName(text);
                                        }}
                                        onBlur={() => validateName(name)}
                                        mode="outlined"
                                        style={styles.input}
                                        error={!!nameError}
                                        disabled={loading}
                                        left={<TextInput.Icon icon="account" />}
                                    />
                                    <HelperText type="error" visible={!!nameError}>
                                        {nameError}
                                    </HelperText>
                                </>
                            )}

                            <Button
                                mode="contained"
                                onPress={isLogin ? handleLogin : handleRegister}
                                loading={loading}
                                disabled={loading}
                                style={styles.primaryButton}
                                icon={isLogin ? "login" : "account-plus"}
                            >
                                {isLogin ? '로그인' : '회원가입'}
                            </Button>

                            <Divider style={styles.divider} />

                            <Button
                                mode="outlined"
                                onPress={handleGuestLogin}
                                loading={loading}
                                disabled={loading}
                                style={styles.guestButton}
                                icon="account-outline"
                            >
                                🎭 게스트로 계속하기
                            </Button>

                            <Button
                                mode="text"
                                onPress={handleModeSwitch}
                                disabled={loading}
                                style={styles.switchButton}
                            >
                                {isLogin
                                    ? '계정이 없으신가요? 회원가입'
                                    : '이미 계정이 있으신가요? 로그인'
                                }
                            </Button>
                        </Card.Content>
                    </Card>
                </Animated.View>

                <Animated.View
                    style={[
                        styles.footer,
                        { opacity: fadeAnim }
                    ]}
                >
                    <Text style={styles.footerText}>
                        🔐 안전한 인증과 개인정보 보호
                    </Text>
                    <Text style={styles.footerSubText}>
                        SSL 암호화 및 최신 보안 기술 적용
                    </Text>
                </Animated.View>
            </ScrollView>

            {loading && <LoadingSpinner overlay={true} text="처리 중..." />}

            {showToast && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    visible={showToast}
                />
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logo: {
        fontSize: 60,
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    },
    card: {
        elevation: 4,
        marginBottom: 20,
        borderRadius: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        marginBottom: 8,
    },
    primaryButton: {
        marginVertical: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    guestButton: {
        marginVertical: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderColor: '#666',
    },
    divider: {
        marginVertical: 16,
    },
    switchButton: {
        marginTop: 8,
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    footerText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        fontWeight: '600',
    },
    footerSubText: {
        fontSize: 12,
        color: '#aaa',
        textAlign: 'center',
        marginTop: 4,
    },
});
