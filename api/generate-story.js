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

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not found in environment variables');
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Create the prompt for Claude
    const prompt = `Create a magical bedtime story for children aged 4-8. Here are the story parameters:

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

Return the response in this exact JSON format:
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
}`;

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Fast and cost-effective model
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      return res.status(500).json({ error: 'Failed to generate story' });
    }

    const claudeResponse = await response.json();
    const storyText = claudeResponse.content[0].text;

    // Parse the JSON response from Claude
    let storyData;
    try {
      storyData = JSON.parse(storyText);
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', parseError);
      console.error('Claude response:', storyText);
      return res.status(500).json({ error: 'Invalid story format received' });
    }

    // Validate the story structure
    if (!storyData.title || !storyData.pages || !Array.isArray(storyData.pages) || storyData.pages.length !== 6) {
      console.error('Invalid story structure:', storyData);
      return res.status(500).json({ error: 'Invalid story structure' });
    }

    // Return the story in the format expected by the frontend
    return res.status(200).json({
      title: storyData.title,
      pages: storyData.pages,
      character: character,
      setting: setting,
      generatedBy: 'Claude AI',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating story:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}