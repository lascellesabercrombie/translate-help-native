import Ionicons from '@expo/vector-icons/Ionicons';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

export default function Library() {
  const db = useSQLiteContext();

  const [texts, setTexts] = useState<{ id: number; family_name: string; personal_name: string; title: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const allRows = await db.getAllAsync<{ id: number; family_name: string; personal_name: string; title: string }>(
        'SELECT texts.id, family_name, personal_name, title FROM authors JOIN texts ON authors.id = texts.author_id;');
      setTexts(allRows);
    };
    fetchData();
  }, []);

  useEffect(() => {
    console.log('texts', texts);
  }, [texts]);

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={<Ionicons size={310} name="book" style={styles.headerImage} />}>
      </ParallaxScrollView>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Library</ThemedText>
      </ThemedView>
        <Pressable>
            <ThemedText type="subtitle">
              Add New Text
            </ThemedText>
        </Pressable>
  
            <ThemedText type="subtitle">
              Select Text
            </ThemedText>

            {/* {loading ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : ( */}
              <FlatList
                data={texts}
                keyExtractor={(item, id) => id.toString()}
                renderItem={({ item }) => 
                <Link  href={{
                  pathname: '/texts/[id]',
                  params: { id: item.id },
                }}>
                  <ThemedText numberOfLines={1}>{item.family_name} {item.personal_name}</ThemedText>
                  <ThemedText numberOfLines={1}>{item.title}</ThemedText>
                </Link>}
              />
              
            {/* )} */}
        {/* <ThemedText type="subtitle">Input Text</ThemedText>
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
          placeholder="Type here"></TextInput>
          <ThemedText type="subtitle">Or</ThemedText>
          <Pressable>
            <ThemedText type="subtitle">
              Upload
            </ThemedText>
          </Pressable> */}

</>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
