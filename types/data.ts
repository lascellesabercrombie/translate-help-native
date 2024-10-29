export interface Author {
    id: number;
    family_name: string;
    personal_name: string;
    family_name_transliterated?: string;
    personal_name_transliterated?: string;
}
  
export interface Text {
    id: number;
    title: string;
    author_id: number;
    language: string;
    text: string;
    is_translation: boolean;
    original_text_id?: number;
}

export type IndexAuthorTextJoin = Pick<Text, 'id' | 'title'> & Pick<Author, 'family_name' | 'personal_name'>;