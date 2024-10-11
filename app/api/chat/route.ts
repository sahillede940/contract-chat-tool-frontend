// app/api/chat/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request : Request) {
  const { prompt } = await request.json();

  try {
    const response = await axios.post('https://api.openai.com/v1/completions', {
      model: 'gpt-4o',  // or any other model
      prompt: prompt,
      max_tokens: 100,
      temperature: 0.7,
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    const message = response.data.choices[0].text.trim();
    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error fetching completion:', error);
    return NextResponse.json({ error: 'Failed to fetch completion' }, { status: 500 });
  }
}
