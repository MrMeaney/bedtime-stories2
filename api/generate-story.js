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

    // Create the prompt for Hugging Face
    const prompt = `<s>[INST] Create a magical bedtime story for children aged 4-8. Here are the story parameters:

Character: ${character}
Setting: ${setting}
Themes: ${themes}
Special Element: ${element}

Please create a story that:
- Is exactly 6 pages long
- Has age-appropriate language and content
- Teaches valuable lessons about ${themes}
- Features the ${character} as the main character
- Takes place in ${setting}
- Incorporates the special ${element} meaningfully
- Has a heartwarming, positive ending
- Each page should be 2-3 sentences perfect for bedtime reading

Return ONLY a valid JSON response in this exact format (no other text):
{
  "title": "Story Title Here",
  "pages": [
    "Page 1 text here (2-3 sentences)",
    "Page 2 text here (2-3 sentences)",
    "Page 3 text here (2-3 sentences)",
    "Page 4 text here (2-3 sentences)",
    "Page 5 text here (2-3 sentences)",
    "Page 6 text here (2-3 sentences)"
  ]
} [/INST]`;

    // Try multiple Hugging Face models for better reliability
    const models = [
      'microsoft/DialoGPT-medium',
      'mistralai/Mixtral-8x7B-Instruct-v0.1',
      'meta-llama/Llama-2-7b-chat-hf',
      'HuggingFaceH4/zephyr-7b-beta'
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
          lastError = `API error: ${response.status}`;
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

        // Extract JSON from the response (remove the prompt part)
        const jsonStart = storyText.indexOf('{');
        const jsonEnd = storyText.lastIndexOf('}') + 1;
        
        if (jsonStart === -1 || jsonEnd === 0) {
          console.error('No JSON found in response:', storyText);
          lastError = 'No JSON found in response';
          continue;
        }

        const jsonString = storyText.substring(jsonStart, jsonEnd);

        // Parse the JSON response
        try {
          storyData = JSON.parse(jsonString);
        } catch (parseError) {
          console.error('Failed to parse JSON:', parseError, 'JSON:', jsonString);
          lastError = 'JSON parse error';
          continue;
        }

        // Validate the story structure
        if (!storyData.title || !storyData.pages || !Array.isArray(storyData.pages)) {
          console.error('Invalid story structure:', storyData);
          lastError = 'Invalid story structure';
          continue;
        }

        // Ensure we have 6 pages
        if (storyData.pages.length < 6) {
          // Pad with additional pages if needed
          while (storyData.pages.length < 6) {
            storyData.pages.push(`The ${character} continued their magical adventure in the ${setting}.`);
          }
        } else if (storyData.pages.length > 6) {
          // Trim to 6 pages
          storyData.pages = storyData.pages.slice(0, 6);
        }

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