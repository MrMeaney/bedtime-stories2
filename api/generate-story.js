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

    // Create a simple, direct prompt that works better with Hugging Face models
    const prompt = `Write a 6-page bedtime story for children about a ${character} in a ${setting} who finds a magical ${element} and learns about ${themes}. Each page should be 2-3 sentences.

Page 1:`;

    // Use models that are better for text generation and more reliable
    const models = [
      'HuggingFaceH4/zephyr-7b-beta',
      'microsoft/DialoGPT-medium',
      'facebook/blenderbot-400M-distill',
      'google/flan-t5-large'
    ];

    let storyData = null;
    let lastError = null;

    for (const model of models) {
      try {
        console.log(`Trying Hugging Face model: ${model}`);
        
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_length: 1000,
              temperature: 0.7,
              do_sample: true,
              top_p: 0.9
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Hugging Face API error for ${model}:`, response.status, errorText);
          lastError = `API error: ${response.status} - ${errorText}`;
          
          // If it's a model loading error, wait a bit before trying next model
          if (response.status === 503) {
            console.log(`Model ${model} is loading, trying next model...`);
          }
          continue;
        }

        const huggingFaceResponse = await response.json();
        console.log('Hugging Face response:', huggingFaceResponse);

        let storyText = '';
        if (Array.isArray(huggingFaceResponse) && huggingFaceResponse[0]?.generated_text) {
          storyText = huggingFaceResponse[0].generated_text;
        } else if (huggingFaceResponse.generated_text) {
          storyText = huggingFaceResponse.generated_text;
        } else {
          console.error('Unexpected response format:', huggingFaceResponse);
          lastError = 'Unexpected response format';
          continue;
        }

        // Remove the prompt from the response
        const storyStart = storyText.indexOf('Page 1:');
        const cleanStory = storyStart !== -1 ? storyText.substring(storyStart) : storyText;

        // Parse the story into pages
        const pages = [];
        const pageRegex = /Page \d+:(.*?)(?=Page \d+:|$)/gs;
        let match;
        
        while ((match = pageRegex.exec(cleanStory)) !== null) {
          const pageText = match[1].trim();
          if (pageText) {
            pages.push(pageText);
          }
        }

        // If regex parsing failed, split by line breaks as fallback
        if (pages.length === 0) {
          const lines = cleanStory.split('\n').filter(line => line.trim());
          for (let i = 0; i < Math.min(6, lines.length); i++) {
            pages.push(lines[i].trim());
          }
        }

        // Ensure we have exactly 6 pages
        while (pages.length < 6) {
          pages.push(`The ${character} continued their magical adventure in the ${setting}.`);
        }
        if (pages.length > 6) {
          pages.splice(6);
        }

        // Create story data
        storyData = {
          title: `The Adventures of ${character}`,
          pages: pages
        };

        console.log(`Successfully generated story with ${model}`);
        break;

      } catch (error) {
        console.error(`Error with model ${model}:`, error);
        lastError = error.message;
        continue;
      }
    }

    // If no model worked, return fallback
    if (!storyData) {
      console.log('All Hugging Face models failed, using fallback');
      return res.status(200).json({
        title: `The Adventures of ${character}`,
        pages: [
          `Once upon a time, in a magical ${setting}, there lived a wonderful ${character}. This ${character} was known throughout the land for being kind and brave.`,
          `One sunny morning, the ${character} discovered a mysterious ${element} hidden beneath an old oak tree. The ${element} sparkled with a warm, golden light.`,
          `As the ${character} touched the ${element}, something amazing happened! It began to glow brighter, and the ${character} felt filled with courage and wisdom.`,
          `The ${character} decided to use the ${element} to help others in the ${setting}. They visited friends who needed help and shared the magic of ${themes}.`,
          `With each act of kindness, the ${element} grew brighter and more beautiful. The ${character} learned that sharing and caring made the magic even stronger.`,
          `As the sun set over the ${setting}, the ${character} smiled peacefully. They had discovered that the greatest magic of all comes from ${themes} and helping others. The end.`
        ],
        character: character,
        setting: setting,
        generatedBy: 'Hugging Face AI (Fallback)',
        timestamp: new Date().toISOString()
      });
    }

    // Return the story in the format expected by the frontend
    return res.status(200).json({
      title: storyData.title,
      pages: storyData.pages,
      character: character,
      setting: setting,
      generatedBy: 'Hugging Face AI',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating story:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}