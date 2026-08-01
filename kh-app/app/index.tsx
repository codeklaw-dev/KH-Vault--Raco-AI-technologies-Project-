import { Redirect } from 'expo-router';
import { useAuth } from '../lib/store/useAuth';

export default function Index() {
  const signedIn = useAuth((s) => s.signedIn);
  return <Redirect href={signedIn ? '/(app)/dashboard' : '/(auth)/login'} />;
}
