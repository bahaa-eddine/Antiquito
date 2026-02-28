import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { Colors, Spacing, Radius, Shadow } from '../utils/constants';

export default function LoginScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const isSignUp = mode === 'signup';

  const switchMode = (next: 'signin' | 'signup') => {
    setMode(next);
    setError('');
    setVerificationSent(false);
    setConfirmPassword('');
  };

  const validate = (): string | null => {
    if (isSignUp && name.trim().length < 2) return 'Please enter your name.';
    if (!email.includes('@') || !email.includes('.')) return 'Enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (isSignUp && password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(credential.user, { displayName: name.trim() });
        await sendEmailVerification(credential.user);
        await signOut(auth); // sign out until they verify
        setVerificationSent(true);
        setMode('signin');
        setName('');
        setPassword('');
        setConfirmPassword('');
      } else {
        const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
        if (!credential.user.emailVerified) {
          await signOut(auth);
          setError('Please verify your email before signing in. Check your inbox.');
        }
        // If verified: onAuthStateChanged fires → store.login() → navigation switches
      }
    } catch (err) {
      const code = (err as any)?.code ?? '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Incorrect email or password.');
      } else if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo ── */}
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Ionicons name="search" size={36} color={Colors.primary} />
            </View>
            <Text style={styles.appName}>ANTIQUITO</Text>
            <Text style={styles.tagline}>Discover the story behind every antique</Text>
          </View>

          {/* ── Verification success banner ── */}
          {verificationSent && (
            <View style={styles.verificationBanner}>
              <Ionicons name="mail-outline" size={20} color={Colors.real} />
              <Text style={styles.verificationText}>
                Verification email sent! Check your inbox, click the link, then sign in below.
              </Text>
            </View>
          )}

          {/* ── Form card ── */}
          <View style={styles.card}>
            {/* Mode toggle */}
            <View style={styles.toggle}>
              <TouchableOpacity
                style={[styles.toggleBtn, mode === 'signin' && styles.toggleBtnActive]}
                onPress={() => switchMode('signin')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, mode === 'signin' && styles.toggleTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, mode === 'signup' && styles.toggleBtnActive]}
                onPress={() => switchMode('signup')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            {/* Name field (sign up only) */}
            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="person-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    placeholderTextColor={Colors.textTertiary}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              </View>
            )}

            {/* Email field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  placeholder="Min. 6 characters"
                  placeholderTextColor={Colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType={isSignUp ? 'next' : 'done'}
                  onSubmitEditing={isSignUp ? undefined : handleSubmit}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={Colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm password field (sign up only) */}
            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.inputFlex]}
                    placeholder="Repeat your password"
                    placeholderTextColor={Colors.textTertiary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={Colors.textTertiary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Error message */}
            {error !== '' && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle-outline" size={15} color={Colors.fake} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Submit button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.footerNote}>
            Your account is securely managed by Firebase Authentication.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    gap: Spacing.lg,
  },

  // ── Logo ──
  logoSection: { alignItems: 'center', gap: Spacing.sm },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 4,
    marginTop: Spacing.xs,
  },
  tagline: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Verification banner ──
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.realLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  verificationText: {
    flex: 1,
    fontSize: 13,
    color: Colors.real,
    lineHeight: 19,
    fontWeight: '500',
  },

  // ── Card ──
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.card,
  },

  // ── Toggle ──
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.sm + 2,
  },
  toggleBtnActive: {
    backgroundColor: Colors.surface,
    ...Shadow.card,
  },
  toggleText: { fontSize: 14, fontWeight: '500', color: Colors.textTertiary },
  toggleTextActive: { color: Colors.text, fontWeight: '600' },

  // ── Inputs ──
  inputGroup: { gap: Spacing.xs },
  inputLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: 15, color: Colors.text, height: '100%' },
  inputFlex: { flex: 1 },
  eyeBtn: { padding: Spacing.xs },

  // ── Error ──
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  errorText: { fontSize: 13, color: Colors.fake, flex: 1 },

  // ── Submit ──
  submitBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
    ...Shadow.strong,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  footerNote: { fontSize: 12, color: Colors.textTertiary, textAlign: 'center', lineHeight: 18 },
});
