import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { createContext, useEffect, useState, Dispatch, SetStateAction } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export interface TextType {
  id: number;
  originalTitle: string;
  translatedTitle: string;
  authorFamilyName: string;
  authorPersonalName: string;
  originalText: string;
  userTranslations: string[];
};

interface TextContextType {
  texts: TextType[];
  setTexts: Dispatch<SetStateAction<TextType[]>>;
};
export const TextContext = createContext<TextContextType | null>(null);
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  
  const [texts, setTexts] = useState<TextType[]>([
    {
      id: 1,
      originalTitle: "静夜思",
      translatedTitle: "Quiet Night Thoughts",
      authorFamilyName: "Li",
      authorPersonalName: "Bai",
      originalText: `床前明月光，\n疑是地上霜。\n举头望明月，\n低头思故乡。`,
      userTranslations: []
    },
    {
      id: 2,
      originalTitle: "悯农",
      translatedTitle: "Peasants",
      authorFamilyName: "Li",
      authorPersonalName: "Shen",
      originalText: `锄禾日当午，\n汗滴禾下土。\n谁知盘中餐，\n粒粒皆辛苦。`,
      userTranslations: []
    },
    {
      id: 3,
      originalTitle: "咏鹅",
      translatedTitle: "To the Goose",
      authorFamilyName: "Luo",
      authorPersonalName: "Binwang",
      originalText: `鹅、鹅、鹅，\n曲项向天歌。\n白毛浮绿水，\n红掌拨清波`,
      userTranslations: []
    },
  ])
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
    <TextContext.Provider value={{texts, setTexts}}>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
    </TextContext.Provider>
  );
}
