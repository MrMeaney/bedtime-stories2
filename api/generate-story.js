export default async function handler(req, res) {
  // Enable CORS for your domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { character, setting, themes, element } = req.body;

    if (!character || !setting || !themes || !element) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Create a better prompt for story generation
    const prompt = `Write a magical bedtime story for children. Character: ${character}. Setting: ${setting}. Magic item: ${element}. Theme: ${themes}. Write exactly 6 short pages, each 2-3 sentences. Make it creative and unique.`;

    // Try free text generation APIs that work better
    const apis = [
      {
        name: 'Pollinations Text',
        url: 'https://text.pollinations.ai/prompt/' + encodeURIComponent(prompt),
        method: 'GET'
      }
    ];

    // Try the APIs
    for (const api of apis) {
      try {
        console.log(`Trying ${api.name}...`);
        
        const response = await fetch(api.url, {
          method: api.method,
          headers: api.method === 'POST' ? { 'Content-Type': 'application/json' } : {}
        });

        if (response.ok) {
          const text = await response.text();
          console.log('API response:', text.substring(0, 200) + '...');
          
          if (text && text.length > 100) {
            // Parse the response into pages
            const pages = parseStoryFromText(text, character, setting, element);
            if (pages.length >= 6) {
              return res.status(200).json({
                title: `The Adventures of ${character}`,
                pages: pages.slice(0, 6),
                character: character,
                setting: setting,
                generatedBy: api.name,
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      } catch (error) {
        console.error(`${api.name} failed:`, error);
        continue;
      }
    }

    console.log('All APIs failed, using fallback story generation');
    
    // Enhanced fallback with more variety
    const storyData = generateEnhancedFallbackStory(character, setting, themes, element);
    
    return res.status(200).json({
      title: storyData.title,
      pages: storyData.pages,
      character: character,
      setting: setting,
      generatedBy: 'Enhanced Template System',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating story:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function parseStoryFromText(text, character, setting, element) {
  // Try to intelligently parse the AI-generated text into pages
  const pages = [];
  
  // Split by common separators
  let parts = text.split(/(?:\n\s*\n|\. {2,}|Page \d+[:.]?)/i);
  
  // Clean and filter parts
  parts = parts
    .map(part => part.trim())
    .filter(part => part.length > 20 && part.length < 500)
    .slice(0, 8); // Take up to 8 parts to pick best 6
  
  // If we have good parts, use them
  if (parts.length >= 4) {
    for (let i = 0; i < Math.min(6, parts.length); i++) {
      pages.push(parts[i]);
    }
  }
  
  return pages;
}

function generateEnhancedFallbackStory(character, setting, themes, element) {
  const storyVariations = [
    {
      title: `${character} and the Magical ${element}`,
      template: [
        `In the heart of the ${setting}, a curious ${character} was exploring when they spotted something glowing. Hidden among the ancient trees was a beautiful ${element} that sparkled like starlight.`,
        `When the ${character} gently touched the ${element}, it began to hum with magical energy. Suddenly, the ${character} could understand the language of all the creatures in the ${setting}.`,
        `A tiny field mouse approached and told the ${character} about a problem. The animals of the ${setting} had lost their way to the magical spring that kept their home beautiful and green.`,
        `The ${character} knew they had to help. Using the power of the ${element}, they created a trail of glowing light that would guide all the lost animals safely home.`,
        `One by one, rabbits, squirrels, and birds followed the magical trail. The ${character} learned that helping others made the ${element} glow even brighter and more beautiful.`,
        `As the sun set over the ${setting}, all the animals were safely home. The ${character} smiled, knowing that the greatest magic comes from ${themes}. The ${element} would always remind them of this wonderful day.`
      ]
    },
    {
      title: `The Adventure of ${character} in ${setting}`,
      template: [
        `Once upon a time, a brave ${character} lived near the magical ${setting}. Every morning, they would explore new paths and discover wonderful secrets hidden throughout the land.`,
        `On this special day, the ${character} found a mysterious ${element} resting beside a babbling brook. The moment they picked it up, the ${element} began to glow with warm, golden light.`,
        `The ${element} showed the ${character} a vision of creatures in the ${setting} who needed help. Some were lost, some were scared, and some just needed a friend to talk to.`,
        `Without hesitation, the ${character} set off on their mission. They used the ${element}'s gentle light to comfort a frightened owl and helped a family of rabbits find their burrow.`,
        `As the ${character} continued helping others, they discovered something amazing. Each act of kindness made the ${element} shine brighter and filled their heart with joy and warmth.`,
        `When evening came, the ${character} sat peacefully in the ${setting}, surrounded by all their new friends. They had learned that ${themes} creates the most powerful magic of all.`
      ]
    }
  ];
  
  const selectedStory = storyVariations[Math.floor(Math.random() * storyVariations.length)];
  
  return {
    title: selectedStory.title,
    pages: selectedStory.template
  };
}