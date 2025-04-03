from PIL import Image, ImageDraw, ImageFont
import os

def create_default_league_image():
    # Create a 400x200 image with a dark background
    img = Image.new('RGB', (400, 200), color='#1E293B')
    draw = ImageDraw.Draw(img)
    
    # Add text
    text = "League Image"
    # Use default font since we can't guarantee system fonts
    draw.text((200, 100), text, fill='#CBD5E1', anchor="mm")
    
    # Ensure the directory exists
    os.makedirs('media/league_images', exist_ok=True)
    
    # Save the image
    img.save('media/league_images/default_league.png')

if __name__ == '__main__':
    create_default_league_image() 