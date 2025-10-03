import type { GlossaryTerm } from '../types';

const mockGlossaryTerms: GlossaryTerm[] = [
  {
    "id": "term1",
    "term": "九皇",
    "definition": "",
    "translation": "Nine Emperors",
    "category": "Title",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1",
    "chapterId": 'ch1'
  },
  {
    "id": "term2",
    "term": "修行者陣營",
    "definition": "",
    "translation": "Practitioner Faction",
    "category": "Faction",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1",
    "chapterId": 'ch1'
  },
  {
    "id": "term3",
    "term": "元",
    "definition": "",
    "translation": "Yuan",
    "category": "Character",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1",
    "chapterId": 'ch1'
  },
  {
    "id": "term4",
    "term": "分意識",
    "definition": "",
    "translation": "Split Consciousness",
    "category": "Concept,Technique",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1",
    "chapterId": 'ch1'
  },
  {
    "id": "term5",
    "term": "劫滅",
    "definition": "",
    "translation": "Cataclysm",
    "category": "Technique",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1",
    "chapterId": 'ch1'
  },
  {
    "id": "term6",
    "term": "千眼始祖",
    "definition": "",
    "translation": "Thousand-Eyed Progenitor",
    "category": "Character",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term7",
    "term": "命核",
    "definition": "",
    "translation": "Life Core",
    "category": "Concept,Body_part",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term8",
    "term": "咒殺劫陣",
    "definition": "",
    "translation": "Curse Killing Cataclysm Formation",
    "category": "Technique,Formation",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term9",
    "term": "夢魘始祖",
    "definition": "",
    "translation": "Nightmare Progenitor",
    "category": "Character",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term10",
    "term": "天生渾源陣營",
    "definition": "",
    "translation": "Innate Primal Chaos Faction",
    "category": "Faction",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term11",
    "term": "始祖",
    "definition": "",
    "translation": "Progenitor",
    "category": "Title",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term12",
    "term": "寂滅始祖",
    "definition": "",
    "translation": "Silent Extinction Progenitor",
    "category": "Character",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term13",
    "term": "摩曼",
    "definition": "",
    "translation": "Momann",
    "category": "Character",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term14",
    "term": "摩曼領主",
    "definition": "",
    "translation": "Lord Momann",
    "category": "Character",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term15",
    "term": "斷生機",
    "definition": "",
    "translation": "Sever Life",
    "category": "Technique",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term16",
    "term": "星芒",
    "definition": "",
    "translation": "Xing Mang",
    "category": "Character",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term17",
    "term": "星芒領主",
    "definition": "",
    "translation": "Lord Xingmang",
    "category": "Character",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term18",
    "term": "時空之母",
    "definition": "",
    "translation": "Mother of Time and Space",
    "category": "Character",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term19",
    "term": "時空噬滅",
    "definition": "",
    "translation": "Time-Space Devour",
    "category": "Technique",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term20",
    "term": "末古斯",
    "definition": "",
    "translation": "Mogus",
    "category": "Character",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term21",
    "term": "毀滅世界之力",
    "definition": "",
    "translation": "Destruction World Force",
    "category": "Technique",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term22",
    "term": "毀滅之淵",
    "definition": "",
    "translation": "Destruction Abyss",
    "category": "Concept,Realm",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term23",
    "term": "沙舟",
    "definition": "",
    "translation": "Shazhou",
    "category": "Character",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term24",
    "term": "波動殺",
    "definition": "",
    "translation": "Wave Kill",
    "category": "Technique",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term25",
    "term": "渾源波動道",
    "definition": "",
    "translation": "Primal Chaos Wave Dao",
    "category": "Cultivation_realm,Technique",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term26",
    "term": "渾源空間",
    "definition": "",
    "translation": "Primal Chaos Space",
    "category": "Realm",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term27",
    "term": "渾源規則運轉之道",
    "definition": "",
    "translation": "Primal Chaos Rule Operation Dao",
    "category": "Concept,Technique",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term28",
    "term": "羅峰",
    "definition": "",
    "translation": "Luo Feng",
    "category": "Character,Protagonist",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term29",
    "term": "血影刀",
    "definition": "",
    "translation": "Blood Shadow Blade",
    "category": "Artifact",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term30",
    "term": "金",
    "definition": "",
    "translation": "Jin",
    "category": "Character",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term31",
    "term": "金領主",
    "definition": "",
    "translation": "Lord Jin",
    "category": "Character",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term32",
    "term": "防御戰陣",
    "definition": "",
    "translation": "Defense Battle Formation",
    "category": "Formation",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term33",
    "term": "靈魂招數",
    "definition": "",
    "translation": "Soul Technique",
    "category": "Technique",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  },
  {
    "id": "term34",
    "term": "領主",
    "definition": "",
    "translation": "Lord",
    "category": "Title",
    "frequency": 0,
    "isUserDefined": false,
    "seriesId": "s1"
  }
];

export default mockGlossaryTerms;