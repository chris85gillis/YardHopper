import { Link, useRouter } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { useAuth } from "@/components/AuthProvider";
import  AuthForm  from "@/components/AuthForm";


export default function Page() {
  const auth = useAuth();
  const router = useRouter();

  async function login(email: string, password: string) {
    // setLoading(true);
    try {
      await auth.login(email, password)
      router.replace("/(tabs)");
    } catch (e) {
      alert("Email or password is incorrect");
    }
    // setLoading(false);
  }

  return (
    <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
      <Text>Login</Text>
      <Link href="/register" replace>
        <Text>Create a new account</Text>
      </Link>
      <AuthForm onSubmit={login} buttonTitle="Sign In" />

      <Pressable onPress={() => {router.replace("/(tabs)")}}>
        <Text>Sign In</Text>
      </Pressable>
    </View>
  );

}