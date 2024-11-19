import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { createContext, useEffect, useState, Suspense, SetStateAction, Dispatch } from 'react';
import 'react-native-reanimated';
import { SQLiteProvider} from 'expo-sqlite';
import { useColorScheme } from '@/hooks/useColorScheme';
import { migrateDbIfNeeded } from '../assets/databases/db';
import Fallback from './fallback';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

interface TextContextType {
  selectedTextId: number | null;
  setSelectedTextId: Dispatch<SetStateAction<number | null>>;
};
export const TextContext = createContext<TextContextType | null>(null);

export default function RootLayout() {
  const [selectedTextId, setSelectedTextId] = useState<number | null>(null);
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Suspense fallback={<Fallback />}>
    <SQLiteProvider databaseName="test.db" onInit={migrateDbIfNeeded} useSuspense>
    <TextContext.Provider value={{ selectedTextId, setSelectedTextId}}>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
    </TextContext.Provider>
    </SQLiteProvider>
    </Suspense>
  );
}
