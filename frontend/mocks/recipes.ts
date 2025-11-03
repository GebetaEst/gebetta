import { id } from "zod/v4/locales";

export const popularTags = [
  "All",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Dessert",
  "Traditional",
  "Fast Food",
  "Spicy",
  "Vegan",
  "Italian",
];

export const regions = [
  "All regions",
  "Addis Ababa",
  "Tigray",
  "Amhara",
  "Oromia",
  "Sidama",
  "Afar",
  "Somali",
  "Benishangul-Gumuz",
  "Gambela",
  "Harari",
];

export const difficulties = ["easy", "medium", "hard"];

export const recipes = [
  {
    id: "1",
    title: "Traditional Doro Wat",
    description:
      "Doro Wat is a spicy Ethiopian chicken stew that's perfect for special occasions. This recipe uses berbere spice blend and niter kibbeh (Ethiopian spiced butter) for authentic flavor.",
    imageUrl:
      "https://images.unsplash.com/photo-1567364816519-cbc9c4ffe1eb?q=80&w=1000",
    prepTime: 30,
    cookTime: 90,
    servings: 6,
    difficulty: "medium",
    ingredients: [
      { id: "1", name: "chicken legs and thighs", amount: "2", unit: "lbs" },
      { id: "2", name: "lemon juice", amount: "2", unit: "tbsp" },
      { id: "3", name: "red onions", amount: "4", unit: "large" },
      { id: "4", name: "garlic", amount: "6", unit: "cloves" },
      { id: "5", name: "ginger", amount: "2", unit: "inches" },
      { id: "6", name: "berbere spice", amount: "1/4", unit: "cup" },
      { id: "7", name: "niter kibbeh", amount: "1/2", unit: "cup" },
      { id: "8", name: "hard-boiled eggs", amount: "6", unit: "" },
      { id: "9", name: "salt", amount: "", unit: "to taste" },
    ],
    steps: [
      {
        id: "1",
        description:
          "Clean the chicken and place in a bowl. Add lemon juice and let sit for 30 minutes.",
      },
      {
        id: "2",
        description:
          "Finely dice the onions and cook in a dry pot on medium heat until they start to brown, about 20-25 minutes.",
      },
      {
        id: "3",
        description:
          "Add minced garlic and ginger, cook for another 5 minutes until fragrant.",
      },
      {
        id: "4",
        description:
          "Add berbere spice and niter kibbeh, stir well to combine. Cook for 5 minutes.",
      },
      {
        id: "5",
        description:
          "Add the chicken pieces and coat well with the sauce. Add enough water to barely cover the chicken.",
      },
      {
        id: "6",
        description:
          "Simmer covered for about 45 minutes, until chicken is tender and sauce has thickened.",
      },
      {
        id: "7",
        description:
          "Add the hard-boiled eggs and simmer for another 10 minutes to allow the eggs to absorb the flavors.",
      },
      {
        id: "8",
        description: "Serve hot with injera bread.",
      },
    ],
    region: "Amhara",
    tags: ["traditional", "spicy", "dinner", "festive"],
    authorId: "1",
    authorName: "Makeda Haile",
    authorAvatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200",
    createdAt: "2023-01-15T12:00:00Z",
    likes: 245,
    isLiked: false,
    isSaved: false,
  },
  {
    id: "2",
    title: "Vegetarian Misir Wat",
    description:
      "Misir Wat is a delicious Ethiopian red lentil stew that's naturally vegan and packed with protein. The berbere spice gives it a wonderful depth of flavor.",
    imageUrl:
      "https://images.unsplash.com/photo-1546549032-9571cd6b27df?q=80&w=1000",
    prepTime: 15,
    cookTime: 45,
    servings: 4,
    difficulty: "easy",
    ingredients: [
      { id: "1", name: "red lentils", amount: "2", unit: "cups" },
      { id: "2", name: "red onion", amount: "1", unit: "large" },
      { id: "3", name: "garlic", amount: "4", unit: "cloves" },
      { id: "4", name: "ginger", amount: "1", unit: "inch" },
      { id: "5", name: "tomato paste", amount: "2", unit: "tbsp" },
      { id: "6", name: "berbere spice", amount: "2", unit: "tbsp" },
      { id: "7", name: "vegetable oil", amount: "1/4", unit: "cup" },
      { id: "8", name: "water", amount: "4", unit: "cups" },
      { id: "9", name: "salt", amount: "", unit: "to taste" },
    ],
    steps: [
      {
        id: "1",
        description:
          "Rinse the red lentils thoroughly until the water runs clear. Set aside.",
      },
      {
        id: "2",
        description:
          "Finely dice the onion and sauté in oil over medium heat until translucent, about 5 minutes.",
      },
      {
        id: "3",
        description:
          "Add minced garlic and ginger, cook for another 2 minutes until fragrant.",
      },
      {
        id: "4",
        description:
          "Add berbere spice and tomato paste, stir well and cook for 2-3 minutes.",
      },
      {
        id: "5",
        description:
          "Add the rinsed lentils and water. Bring to a boil, then reduce heat and simmer.",
      },
      {
        id: "6",
        description:
          "Cook uncovered for about 30-40 minutes, stirring occasionally, until lentils are soft and the stew has thickened.",
      },
      {
        id: "7",
        description: "Season with salt to taste.",
      },
      {
        id: "8",
        description: "Serve hot with injera bread or rice.",
      },
    ],
    region: "Addis Ababa",
    tags: ["vegetarian", "vegan", "healthy", "dinner"],
    authorId: "2",
    authorName: "Abebe Kebede",
    authorAvatar:
      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=200",
    createdAt: "2023-02-20T15:30:00Z",
    likes: 189,
    isLiked: false,
    isSaved: false,
  },
  {
    id: "3",
    title: "Quick Shiro Wat",
    description:
      "Shiro is a delicious Ethiopian chickpea powder stew that's quick to make and full of flavor. It's a staple in Ethiopian cuisine and perfect for busy weeknights.",
    imageUrl:
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?q=80&w=1000",
    prepTime: 10,
    cookTime: 25,
    servings: 4,
    difficulty: "easy",
    ingredients: [
      { id: "1", name: "shiro powder", amount: "1", unit: "cup" },
      { id: "2", name: "red onion", amount: "1", unit: "medium" },
      { id: "3", name: "garlic", amount: "3", unit: "cloves" },
      { id: "4", name: "tomato", amount: "1", unit: "medium" },
      { id: "5", name: "vegetable oil", amount: "3", unit: "tbsp" },
      { id: "6", name: "water", amount: "3", unit: "cups" },
      { id: "7", name: "berbere spice", amount: "1", unit: "tsp" },
      { id: "8", name: "salt", amount: "", unit: "to taste" },
    ],
    steps: [
      {
        id: "1",
        description:
          "Finely dice the onion, garlic, and tomato.",
      },
      {
        id: "2",
        description:
          "Heat oil in a pot over medium heat. Add onions and cook until soft, about 5 minutes.",
      },
      {
        id: "3",
        description:
          "Add garlic and cook for another minute until fragrant.",
      },
      {
        id: "4",
        description:
          "Add diced tomato and berbere spice, cook for 2-3 minutes.",
      },
      {
        id: "5",
        description:
          "Gradually add water while stirring to avoid lumps.",
      },
      {
        id: "6",
        description:
          "Slowly add the shiro powder while continuously stirring to prevent lumps from forming.",
      },
      {
        id: "7",
        description:
          "Reduce heat to low and simmer for about 15-20 minutes, stirring occasionally, until it reaches your desired consistency.",
      },
      {
        id: "8",
        description:
          "Season with salt to taste and serve hot with injera bread.",
      },
    ],
    region: "Tigray",
    tags: ["vegetarian", "vegan", "quick", "dinner"],
    authorId: "3",
    authorName: "Sara Tesfaye",
    authorAvatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200",
    createdAt: "2023-03-10T09:15:00Z",
    likes: 156,
    isLiked: false,
    isSaved: false,
  },
  {
    id: "4",
    title: "Kitfo (Ethiopian Steak Tartare)",
    description:
      "Kitfo is a traditional Ethiopian dish made from raw minced beef, seasoned with mitmita (a spicy chili powder) and niter kibbeh (clarified butter). It can be served raw, rare, or well-done according to preference.",
    imageUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000",
    prepTime: 20,
    cookTime: 5,
    servings: 4,
    difficulty: "medium",
    ingredients: [
      { id: "1", name: "lean beef tenderloin", amount: "1", unit: "lb" },
      { id: "2", name: "mitmita spice", amount: "2", unit: "tbsp" },
      { id: "3", name: "niter kibbeh", amount: "1/4", unit: "cup" },
      { id: "4", name: "korarima (cardamom)", amount: "1/2", unit: "tsp" },
      { id: "5", name: "koseret (dried herb)", amount: "1/2", unit: "tsp" },
      { id: "6", name: "ayib (Ethiopian cottage cheese)", amount: "1/2", unit: "cup" },
      { id: "7", name: "gomen (collard greens)", amount: "1", unit: "bunch" },
      { id: "8", name: "salt", amount: "", unit: "to taste" },
    ],
    steps: [
      {
        id: "1",
        description:
          "Trim any fat from the beef and mince it very finely with a sharp knife. For authentic kitfo, the beef should be hand-cut, not ground.",
      },
      {
        id: "2",
        description:
          "In a bowl, combine the minced beef with mitmita spice, korarima, and koseret.",
      },
      {
        id: "3",
        description:
          "Warm the niter kibbeh until just melted but not hot, then pour over the seasoned meat.",
      },
      {
        id: "4",
        description:
          "Mix everything thoroughly with your hands until well combined.",
      },
      {
        id: "5",
        description:
          "For traditional kitfo (raw), serve immediately. For kitfo leb leb (rare), warm slightly in a pan. For fully cooked kitfo, cook until well done.",
      },
      {
        id: "6",
        description:
          "Serve with ayib (Ethiopian cottage cheese) and gomen (collard greens) on the side.",
      },
      {
        id: "7",
        description:
          "Enjoy with injera bread for an authentic Ethiopian experience.",
      },
    ],
    region: "Gurage",
    tags: ["traditional", "festive", "dinner"],
    authorId: "4",
    authorName: "Dawit Mulugeta",
    authorAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200",
    createdAt: "2023-04-05T18:45:00Z",
    likes: 132,
    isLiked: false,
    isSaved: false,
  },
  {
    id: "5",
    title: "Injera (Ethiopian Sourdough Flatbread)",
    description:
      "Injera is a sourdough flatbread that's essential to Ethiopian cuisine. It serves as both plate and utensil for most Ethiopian meals. This recipe uses teff flour for authentic flavor and texture.",
    imageUrl:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1000",
    prepTime: 20,
    cookTime: 30,
    servings: 8,
    difficulty: "hard",
    ingredients: [
      { id: "1", name: "teff flour", amount: "2", unit: "cups" },
      { id: "2", name: "water", amount: "3", unit: "cups" },
      { id: "3", name: "salt", amount: "1/2", unit: "tsp" },
      { id: "4", name: "vegetable oil", amount: "", unit: "for cooking" },
    ],
    steps: [
      {
        id: "1",
        description:
          "In a large bowl, mix teff flour with 2 cups of water until smooth.",
      },
      {
        id: "2",
        description:
          "Cover with a cloth and let ferment at room temperature for 3-4 days. The mixture will bubble and develop a sour smell.",
      },
      {
        id: "3",
        description:
          "After fermentation, add salt and remaining water to thin the batter. It should be the consistency of thin pancake batter.",
      },
      {
        id: "4",
        description:
          "Heat a non-stick pan or traditional mitad over medium heat. Lightly oil the surface.",
      },
      {
        id: "5",
        description:
          "Pour about 1/2 cup of batter onto the pan in a spiral motion, starting from the outside and working inward.",
      },
      {
        id: "6",
        description:
          "Cover and cook for about 2-3 minutes until bubbles form on the surface and the edges begin to lift.",
      },
      {
        id: "7",
        description:
          "Do not flip the injera. It should only be cooked on one side.",
      },
      {
        id: "8",
        description:
          "Remove from pan and let cool on a cloth. Repeat with remaining batter.",
      },
    ],
    region: "Addis Ababa",
    tags: ["traditional", "vegetarian", "vegan", "bread"],
    authorId: "5",
    authorName: "Tigist Bekele",
    authorAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200",
    createdAt: "2023-05-12T10:20:00Z",
    likes: 210,
    isLiked: false,
    isSaved: false,
  },
  {
    id: "6",
    title: "Ethiopian Tibs (Sautéed Beef)",
    description:
      "Tibs is a popular Ethiopian dish of sautéed meat and vegetables. This version uses beef, but you can substitute with lamb or chicken if preferred.",
    imageUrl:
      "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?q=80&w=1000",
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    difficulty: "medium",
    ingredients: [
      { id: "1", name: "beef sirloin", amount: "1", unit: "lb" },
      { id: "2", name: "red onion", amount: "1", unit: "large" },
      { id: "3", name: "tomatoes", amount: "2", unit: "medium" },
      { id: "4", name: "jalapeño peppers", amount: "2", unit: "" },
      { id: "5", name: "garlic", amount: "4", unit: "cloves" },
      { id: "6", name: "rosemary", amount: "2", unit: "sprigs" },
      { id: "7", name: "berbere spice", amount: "1", unit: "tbsp" },
      { id: "8", name: "niter kibbeh", amount: "3", unit: "tbsp" },
      { id: "9", name: "salt and pepper", amount: "", unit: "to taste" },
    ],
    steps: [
      {
        id: "1",
        description:
          "Cut the beef into 1-inch cubes. Season with salt, pepper, and half of the berbere spice.",
      },
      {
        id: "2",
        description:
          "Heat niter kibbeh in a large skillet over high heat until hot but not smoking.",
      },
      {
        id: "3",
        description:
          "Add the beef in a single layer and sear without stirring for 2-3 minutes to develop a crust.",
      },
      {
        id: "4",
        description:
          "Stir and continue cooking for another 2-3 minutes until browned on all sides. Remove beef and set aside.",
      },
      {
        id: "5",
        description:
          "In the same pan, add sliced onions and cook until softened, about 5 minutes.",
      },
      {
        id: "6",
        description:
          "Add minced garlic, diced tomatoes, sliced jalapeños, rosemary, and remaining berbere spice.",
      },
      {
        id: "7",
        description:
          "Cook for 5 minutes until tomatoes break down slightly.",
      },
      {
        id: "8",
        description:
          "Return beef to the pan and cook for another 5 minutes until everything is well combined and heated through.",
      },
      {
        id: "9",
        description:
          "Serve hot with injera bread.",
      },
    ],
    region: "Oromia",
    tags: ["dinner", "spicy", "traditional"],
    authorId: "6",
    authorName: "Solomon Girma",
    authorAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
    createdAt: "2023-06-18T14:10:00Z",
    likes: 178,
    isLiked: false,
    isSaved: false,
  },
  {
    id: "7",
    title: "Dabo (Ethiopian Homemade Bread)",
    description:
      "Dabo is a traditional Ethiopian bread that's slightly sweet and perfect for breakfast or as a snack with tea. This version is baked in the oven, but it can also be made in a pot on the stovetop.",
    imageUrl:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000",
    prepTime: 30,
    cookTime: 45,
    servings: 8,
    difficulty: "medium",
    ingredients: [
      { id: "1", name: "all-purpose flour", amount: "4", unit: "cups" },
      { id: "2", name: "active dry yeast", amount: "2", unit: "tsp" },
      { id: "3", name: "sugar", amount: "1/4", unit: "cup" },
      { id: "4", name: "salt", amount: "1", unit: "tsp" },
      { id: "5", name: "warm water", amount: "1 1/2", unit: "cups" },
      { id: "6", name: "vegetable oil", amount: "1/4", unit: "cup" },
      { id: "7", name: "eggs", amount: "2", unit: "" },
      { id: "8", name: "cardamom", amount: "1/2", unit: "tsp" },
      { id: "9", name: "sesame seeds", amount: "2", unit: "tbsp" },
    ],
    steps: [
      {
        id: "1",
        description:
          "In a large bowl, dissolve yeast and 1 tablespoon of sugar in warm water. Let stand for about 10 minutes until foamy.",
      },
      {
        id: "2",
        description:
          "Add the remaining sugar, salt, oil, eggs, and cardamom. Mix well.",
      },
      {
        id: "3",
        description:
          "Gradually add flour, mixing until a soft dough forms.",
      },
      {
        id: "4",
        description:
          "Knead the dough on a floured surface for about 10 minutes until smooth and elastic.",
      },
      {
        id: "5",
        description:
          "Place in an oiled bowl, cover, and let rise in a warm place for about 1 hour or until doubled in size.",
      },
      {
        id: "6",
        description:
          "Punch down the dough and shape into a round loaf. Place on a greased baking sheet.",
      },
      {
        id: "7",
        description:
          "Cover and let rise for another 30 minutes.",
      },
      {
        id: "8",
        description:
          "Brush the top with beaten egg and sprinkle with sesame seeds.",
      },
      {
        id: "9",
        description:
          "Bake in a preheated 350°F (175°C) oven for 35-45 minutes until golden brown and sounds hollow when tapped.",
      },
      {
        id: "10",
        description:
          "Let cool before slicing and serving.",
      },
    ],
    region: "Addis Ababa",
    tags: ["breakfast", "bread", "vegetarian"],
    authorId: "7",
    authorName: "Hanna Tadesse",
    authorAvatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200",
    createdAt: "2023-07-22T08:30:00Z",
    likes: 145,
    isLiked: false,
    isSaved: false,
  },
  {
    id: "8",
    title: "Kategna (Ethiopian Spiced Bread)",
    description:
      "Kategna is a simple yet delicious Ethiopian snack made from toasted injera bread spread with spiced butter. It's perfect as an appetizer or quick snack.",
    imageUrl:
      "https://images.unsplash.com/photo-1532980400857-e8d9d275d858?q=80&w=1000",
    prepTime: 5,
    cookTime: 10,
    servings: 4,
    difficulty: "easy",
    ingredients: [
      { id: "1", name: "injera bread", amount: "2", unit: "pieces" },
      { id: "2", name: "niter kibbeh", amount: "4", unit: "tbsp" },
      { id: "3", name: "berbere spice", amount: "2", unit: "tsp" },
      { id: "4", name: "garlic powder", amount: "1/2", unit: "tsp" },
      { id: "5", name: "salt", amount: "", unit: "to taste" },
    ],
    steps: [
      {
        id: "1",
        description:
          "In a small bowl, mix niter kibbeh with berbere spice, garlic powder, and salt to create a spiced butter.",
      },
      {
        id: "2",
        description:
          "Cut injera bread into quarters or desired serving sizes.",
      },
      {
        id: "3",
        description:
          "Heat a skillet or griddle over medium heat.",
      },
      {
        id: "4",
        description:
          "Spread the spiced butter mixture generously on one side of each injera piece.",
      },
      {
        id: "5",
        description:
          "Place the injera butter-side down on the hot skillet.",
      },
      {
        id: "6",
        description:
          "Cook for about 2-3 minutes until crispy and golden brown.",
      },
      {
        id: "7",
        description:
          "Flip and cook the other side for about 1 minute.",
      },
      {
        id: "8",
        description:
          "Serve hot as an appetizer or snack.",
      },
    ],
    region: "Amhara",
    tags: ["appetizer", "quick", "vegetarian", "snack"],
    authorId: "8",
    authorName: "Yonas Alemu",
    authorAvatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200",
    createdAt: "2023-08-05T16:40:00Z",
    likes: 98,
    isLiked: false,
    isSaved: false,
  },
];
