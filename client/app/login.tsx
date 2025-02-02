import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Pressable,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import { useAuth } from "@/components/AuthProvider";
import { Link, useRouter } from "expo-router";

export default function LoginScreen() {
  const auth = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authenticateWithBiometrics = async () => {
      try {
        const isBiometricEnabled = await SecureStore.getItemAsync("useBiometrics");
        const storedEmail = await SecureStore.getItemAsync("userEmail");
        const storedPassword = await SecureStore.getItemAsync("userPassword");

        if (isBiometricEnabled === "true" && storedEmail && storedPassword) {
          const { success } = await LocalAuthentication.authenticateAsync({
            promptMessage: "Authenticate to log in",
          });

          if (success) {
            setEmail(storedEmail);
            setPassword(storedPassword);
          }
        }
      } catch (error) {
        console.error("Biometric authentication error:", error);
        Alert.alert("Authentication Failed", "Please log in manually.");
      } finally {
        setLoading(false);
      }
    };

    authenticateWithBiometrics();
  }, []);

//   useEffect(() => {
//     if (email && password) {
//       login(email, password); // Automatically log in when email and password are set
//     }
//   }, [email, password]);

const handleLogIn = () => {
    try {
        if (email === "") {
            Alert.alert("Missing email.");
        } else if (password === "") {
            Alert.alert("Missing password.");
        }
        login(email, password);
    } catch (error) {
        Alert.alert("Error", (error as Error).message);
    }
}

  async function login(email: string, password: string) {
    try {
      // console.log(`Logging in with ${email} and ${password}`);
      await auth.login(email, password);

      // Save user credentials and enable biometrics for the next login
      const token = "exampleToken"; // Replace with actual token
      await SecureStore.setItemAsync("userToken", token);
      await SecureStore.setItemAsync("userEmail", email);
      await SecureStore.setItemAsync("userPassword", password);
      await SecureStore.setItemAsync("useBiometrics", "true");

      router.replace("/(tabs)");
    } catch (e) {
      alert("Email or password is incorrect");
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#159636" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <Image source={require("../assets/images/logo.png")} style={styles.logo} />

        <View style={styles.formContainer}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#A9A9A9"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#A9A9A9"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable onPress={() => login(email, password)} style={styles.loginButton}>
            <Text style={styles.loginButtonText} onPress={handleLogIn}>Log In</Text>
          </Pressable>
          <View style={styles.signupContainer}>
            <Link href="/register">
              <Text style={styles.signupText}>No account? Sign up</Text>
            </Link>
          </View>
          <View style={styles.signupContainer}>
            <Link href="/forgot-password">
              <Text style={styles.signupText}>Forgot password?</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 255,
    height: 320,
    marginBottom: 60,
    padding: 30,
  },
  formContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  input: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    width: "100%",
  },
  loginButton: {
    backgroundColor: "#159636",
    borderRadius: 30,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
    marginLeft: "auto",
    marginRight: "auto",
    width: "50%",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginTop: 30,
  },
  signupText: {
    color: "#159636",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
