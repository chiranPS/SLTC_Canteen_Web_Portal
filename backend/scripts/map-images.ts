/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

function getBestMatchingImage(mealName: string, categoryName: string, files: string[]): string | null {
  // Normalize names: lowercase and keep alphanumeric only
  let normMeal = mealName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normCategory = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Handle common plural/singular or spelling variations
  normMeal = normMeal.replace('sausages', 'sausage');

  // 1. Direct custom rules for matches
  if (normMeal === 'plaintea') {
    const match = files.find(f => f.toLowerCase().includes('planetea'));
    if (match) return match;
  }

  if (normMeal === 'koththu' || normMeal === 'stringhopperkoththu') {
    const match = files.find(f => f.toLowerCase().includes('kottu'));
    if (match) return match;
  }

  if (normMeal === 'riceandcurryveg') {
    if (normCategory === 'lunch') {
      const match = files.find(f => f.toLowerCase().includes('rice-and-curry-default-2'));
      if (match) return match;
    } else if (normCategory === 'dinner') {
      const match = files.find(f => f.toLowerCase().includes('rice-and-curry-default-3'));
      if (match) return match;
    }
  }

  if (normMeal === 'riceandcurry' && normCategory === 'breakfast') {
    const match = files.find(
      f => f.toLowerCase().includes('rice-and-curry-default') && 
           !f.toLowerCase().includes('default-2') && 
           !f.toLowerCase().includes('default-3')
    );
    if (match) return match;
  }

  // 2. Loop through all files and find exact or partial matches
  const matches = files.map(file => {
    // Normalize filename (without extension)
    const baseName = path.parse(file).name;
    const normFile = baseName.toLowerCase().replace(/[^a-z0-9]/g, '').replace('sausages', 'sausage');
    return { file, normFile };
  });

  // Try exact normalized match (e.g. "biriyani" === "biriyani")
  let found = matches.find(m => m.normFile === normMeal);
  if (found) return found.file;

  // Try containment (e.g. "friedricechickenmixed" matches "friedricechickenmix")
  found = matches.find(m => m.normFile.includes(normMeal) || normMeal.includes(m.normFile));
  if (found) return found.file;

  return null;
}

async function main() {
  const uploadsDir = path.join(__dirname, '../uploads/meals');
  if (!fs.existsSync(uploadsDir)) {
    console.error(`Uploads directory does not exist at: ${uploadsDir}`);
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  console.log(`Found ${files.length} files in uploads directory.`);

  // Get all meals in the database with their category info
  const meals = await prisma.meal.findMany({
    include: {
      category: true
    }
  });

  console.log(`Matching images for ${meals.length} meals...`);

  let matchedCount = 0;

  for (const meal of meals) {
    const matchedFile = getBestMatchingImage(meal.name, meal.category.name, files);
    
    if (matchedFile) {
      const imageUrl = `/uploads/meals/${matchedFile}`;
      await prisma.meal.update({
        where: { id: meal.id },
        data: { imageUrl }
      });
      console.log(`✅ MATCHED: "${meal.name}" (${meal.category.name}) -> ${matchedFile}`);
      matchedCount++;
    } else {
      // Clear the image path if no matching file exists, showing placeholder instead of wrong image
      await prisma.meal.update({
        where: { id: meal.id },
        data: { imageUrl: null }
      });
      console.log(`❌ NO MATCH: "${meal.name}" (${meal.category.name}) -> set to NULL`);
    }
  }

  console.log(`\nMapping complete! Matched ${matchedCount}/${meals.length} meals.`);
}

main()
  .catch((e) => {
    console.error('Error mapping images:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
