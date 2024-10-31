import Ionicons from '@expo/vector-icons/Ionicons';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useContext, useEffect, useState } from 'react';
import { IndexAuthorTextJoin } from '@/types/data';
import { TextContext } from '../_layout';


export default function Library() {
  const db = useSQLiteContext();
  const setSelectedTextId = useContext(TextContext)?.setSelectedTextId;

  const [texts, setTexts] = useState<IndexAuthorTextJoin[]>([]);

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      const allRows = await db.getAllAsync<IndexAuthorTextJoin>(
        'SELECT texts.id, family_name, personal_name, title FROM authors JOIN texts ON authors.id = texts.author_id WHERE texts.is_translation = 0;');
      if (mounted) {
        setTexts(allRows);
      }
    };
    
    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

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
                <Pressable onPress={() => {
                    if (setSelectedTextId) {
                      setSelectedTextId(item.id); 
                    } else {
                      console.error("setSelectedTextId not found in context");
                    }
                }}>
                <Link  
                href={{
                  pathname: '/texts/[id]',
                  params: { id: item.id },
                }}
                >
                  <ThemedText numberOfLines={1}>{item.family_name} {item.personal_name}</ThemedText>
                  <ThemedText numberOfLines={1}>{item.title}</ThemedText>
                </Link>
                </Pressable>
                }
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
