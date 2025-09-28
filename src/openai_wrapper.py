import openai


client = openai.OpenAI()

def get_completion(system_prompt, prompt, model="gpt-4o-mini"):
    messages = [{"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}]
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.7,
    )
    return response.choices[0].message.content