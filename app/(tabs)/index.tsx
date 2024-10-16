import Ionicons from '@expo/vector-icons/Ionicons';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link } from 'expo-router';

export type TextType = {
  id: number;
  originalTitle: string;
  translatedTitle: string;
  authorFamilyName: string;
  authorPersonalName: string;
  originalText: string;
  userTranslations: string[];
};

export const texts: TextType[] = [
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
];

export default function Library() {
  // const [loading, setLoading] = useState(false);
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={<Ionicons size={310} name="book" style={styles.headerImage} />}>
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
                  <ThemedText numberOfLines={1}>{item.authorFamilyName} {item.authorPersonalName}</ThemedText>
                  <ThemedText numberOfLines={1}>{item.originalTitle}</ThemedText>
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

    </ParallaxScrollView>
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
